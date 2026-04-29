param([string]$TargetDomain)

$ErrorActionPreference = 'SilentlyContinue'

function Format-DateForJSON {
    param($Date)
    if ($null -eq $Date -or $Date -eq [DateTime]::MinValue) { return $null }
    try {
        if ($Date -is [DateTime]) { return $Date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") }
        return ([DateTime]::Parse($Date)).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } catch { return $null }
}

# Decode the raw TrustAttributes integer into a readable list of flags
function Get-TrustAttributesDecoded {
    param([int]$Attributes)
    $flags = [System.Collections.Generic.List[string]]::new()
    if ($Attributes -band 0x0001) { $flags.Add('Non-Transitive') }
    if ($Attributes -band 0x0002) { $flags.Add('Uplevel Only (Win2000+)') }
    if ($Attributes -band 0x0004) { $flags.Add('SID Filtering (Quarantined)') }
    if ($Attributes -band 0x0008) { $flags.Add('Forest Transitive') }
    if ($Attributes -band 0x0010) { $flags.Add('Selective Authentication') }
    if ($Attributes -band 0x0020) { $flags.Add('Within Forest') }
    if ($Attributes -band 0x0040) { $flags.Add('Treat as External') }
    if ($Attributes -band 0x0080) { $flags.Add('Uses RC4 Encryption') }
    if ($Attributes -band 0x0200) { $flags.Add('No TGT Delegation') }
    if ($Attributes -band 0x0400) { $flags.Add('PIM Trust') }
    if ($flags.Count -eq 0) { return 'None' }
    return ($flags -join ', ')
}

# Compute a security risk level for external/forest trusts based on key security controls
function Get-TrustRisk {
    param(
        [bool]$IntraForest,
        [bool]$SelectiveAuth,
        [bool]$SIDFilteringQuarantined,
        [bool]$SIDFilteringForestAware,
        [bool]$UsesRC4,
        [string]$Direction
    )

    # Intra-forest trusts are implicitly trusted — governance risk only
    if ($IntraForest) { return 'Info' }

    # Disabled trust — not active, low risk
    if ($Direction -eq 'Disabled') { return 'Info' }

    $riskFactors = @()

    # Selective Auth not enabled on external trust means any authenticated user in the
    # trusted forest/domain can authenticate to resources on this side
    if (-not $SelectiveAuth) {
        $riskFactors += 'No Selective Authentication'
    }

    # SID Filtering disabled allows SID History attacks across the trust boundary
    if (-not $SIDFilteringQuarantined -and -not $SIDFilteringForestAware) {
        $riskFactors += 'SID Filtering Disabled'
    }

    # RC4 is a weak cipher — should use AES
    if ($UsesRC4) {
        $riskFactors += 'RC4 Encryption'
    }

    $level = switch ($riskFactors.Count) {
        0       { 'Low' }
        1       { 'Medium' }
        default { 'High' }
    }

    return $level
}

try {
    Import-Module ActiveDirectory -ErrorAction Stop
}
catch {
    @{ Error = "Failed to load ActiveDirectory module: $($_.Exception.Message)" } | ConvertTo-Json
    exit 1
}

$serverParam = @{}
    $credParam = if ($global:PSADCredential) { @{Credential = $global:PSADCredential} } else { @{} }
if ($TargetDomain) { $serverParam['Server'] = $TargetDomain }

$AllTrusts = New-Object System.Collections.Generic.List[PSObject]
$Now = Get-Date

try {
    $Forest = Get-ADForest @serverParam @credParam -ErrorAction Stop
    $RootDomain = $Forest.RootDomain
    $AllDomains = if ($TargetDomain) { @($TargetDomain) } else { $Forest.Domains }

    function Add-TrustRecord {
        param($Trust, $SourceDomain, $SourceLevel)

        $usesRC4 = [bool]$Trust.UsesRC4Encryption

        $trustAgeDays = $null
        if ($Trust.Created -and $Trust.Created -ne [DateTime]::MinValue) {
            $trustAgeDays = [math]::Round(($Now - $Trust.Created).TotalDays, 0)
        }

        $direction = switch ($Trust.Direction) {
            0 { 'Disabled' }
            1 { 'Inbound' }
            2 { 'Outbound' }
            3 { 'Bidirectional' }
            default { [string]$Trust.Direction }
        }

        $attrInt = [int]($Trust.TrustAttributes)

        $riskLevel = Get-TrustRisk `
            -IntraForest       ([bool]$Trust.IntraForest) `
            -SelectiveAuth     ([bool]$Trust.SelectiveAuthentication) `
            -SIDFilteringQuarantined ([bool]$Trust.SIDFilteringQuarantined) `
            -SIDFilteringForestAware ([bool]$Trust.SIDFilteringForestAware) `
            -UsesRC4           $usesRC4 `
            -Direction         $direction

        [PSCustomObject]@{
            SourceDomain             = $SourceDomain
            SourceLevel              = $SourceLevel
            TargetDomain             = $Trust.Target
            TrustType                = $Trust.TrustType
            TrustDirection           = $direction
            TrustAttributes          = $attrInt
            AttributesDecoded        = Get-TrustAttributesDecoded $attrInt
            ForestTransitive         = $Trust.ForestTransitive
            SelectiveAuth            = $Trust.SelectiveAuthentication
            SIDFilteringForestAware  = $Trust.SIDFilteringForestAware
            SIDFilteringQuarantined  = $Trust.SIDFilteringQuarantined
            DisallowTransivity       = $Trust.DisallowTransivity
            IntraForest              = $Trust.IntraForest
            IsTreeParent             = $Trust.IsTreeParent
            IsTreeRoot               = $Trust.IsTreeRoot
            TGTDelegation            = $Trust.TGTDelegation
            UplevelOnly              = $Trust.UplevelOnly
            UsesAESKeys              = $Trust.UsesAESKeys
            UsesRC4Encryption        = $usesRC4
            TrustAgeDays             = $trustAgeDays
            SecurityRisk             = $riskLevel
            Created                  = Format-DateForJSON $Trust.Created
            Modified                 = Format-DateForJSON $Trust.Modified
            DistinguishedName        = $Trust.DistinguishedName
        }
    }

    # Forest-level trusts from the root domain
    try {
        $ForestTrusts = Get-ADTrust -Filter * -Server $RootDomain -ErrorAction SilentlyContinue
        foreach ($Trust in $ForestTrusts) {
            $AllTrusts.Add((Add-TrustRecord $Trust $RootDomain 'Forest Root'))
        }
    } catch { }

    # Trusts from each child domain (skip root — already processed)
    foreach ($Domain in $AllDomains) {
        if ($Domain -eq $RootDomain) { continue }
        try {
            $DomainTrusts = Get-ADTrust -Filter * -Server $Domain -ErrorAction SilentlyContinue
            foreach ($Trust in $DomainTrusts) {
                $Exists = $AllTrusts | Where-Object {
                    $_.SourceDomain -eq $Domain -and $_.TargetDomain -eq $Trust.Target
                }
                if (-not $Exists) {
                    $AllTrusts.Add((Add-TrustRecord $Trust $Domain 'Child Domain'))
                }
            }
        } catch { }
    }
}
catch {
    @{ Error = "Failed to query forest trusts: $($_.Exception.Message)" } | ConvertTo-Json
    exit 1
}

if ($AllTrusts.Count -eq 0) {
    @() | ConvertTo-Json
} else {
    @($AllTrusts) | ConvertTo-Json -Depth 5
}
