param(
    [string]$TargetDomain
)

$ErrorActionPreference = 'SilentlyContinue'

function Format-DateForJSON {
    param($Date)
    if ($null -eq $Date -or $Date -eq [DateTime]::MinValue) { return $null }
    try {
        if ($Date -is [DateTime]) { return $Date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") }
        return ([DateTime]::Parse($Date)).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } catch { return $null }
}

try {
    Import-Module ActiveDirectory -ErrorAction Stop
    $credParam = if ($global:PSADCredential) { @{Credential = $global:PSADCredential} } else { @{} }
    $WarningPreference = 'SilentlyContinue'

    $anchorDomain = if ($TargetDomain) { $TargetDomain } else { (Get-ADDomain).DNSRoot }
    $forest = Get-ADForest -Server $anchorDomain -ErrorAction Stop @credParam
    $domainsToQuery = if ($TargetDomain) { @($TargetDomain) } else { @($forest.Domains) }

    $Results = New-Object System.Collections.Generic.List[PSObject]
    $Now = Get-Date

    foreach ($domain in $domainsToQuery) {
        try {
            # All users (enabled and disabled) with a non-empty employeeType
            $users = Get-ADUser -LDAPFilter '(&(objectClass=user)(employeeType=*))' -Server $domain -Properties DisplayName, SamAccountName, mail, Enabled, employeeType, extensionAttribute6, Department, Title, AccountExpirationDate, PasswordLastSet, LastLogonDate, WhenCreated, DistinguishedName -ErrorAction SilentlyContinue @credParam

            foreach ($user in @($users)) {
                $daysUntilExpiry  = $null
                $expiryStatus     = 'No Expiration Set'
                $accountExpires   = $null

                if ($user.AccountExpirationDate -and $user.AccountExpirationDate -ne [DateTime]::MinValue) {
                    $accountExpires  = Format-DateForJSON $user.AccountExpirationDate
                    $daysUntilExpiry = [math]::Round(($user.AccountExpirationDate - $Now).TotalDays, 0)
                    $expiryStatus    = if ($daysUntilExpiry -lt 0)   { 'Expired' }
                                      elseif ($daysUntilExpiry -le 30) { 'Expiring Soon' }
                                      else                            { 'Active' }
                }

                $Results.Add([PSCustomObject]@{
                    Name              = $user.DisplayName
                    SamAccountName    = $user.SamAccountName
                    Email             = $user.mail
                    Enabled           = $user.Enabled
                    EmployeeType      = $user.employeeType
                    EA6               = $user.extensionAttribute6
                    Department        = $user.Department
                    Title             = $user.Title
                    Domain            = $domain
                    AccountExpires    = $accountExpires
                    DaysUntilExpiry   = $daysUntilExpiry
                    ExpiryStatus      = $expiryStatus
                    PasswordLastSet   = Format-DateForJSON $user.PasswordLastSet
                    LastLogon         = Format-DateForJSON $user.LastLogonDate
                    Created           = Format-DateForJSON $user.WhenCreated
                    DistinguishedName = $user.DistinguishedName
                })
            }
        } catch { }
    }

    @($Results) | ConvertTo-Json -Depth 3
}
catch {
    @{ Error = $_.Exception.Message } | ConvertTo-Json
    exit 1
}
