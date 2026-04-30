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

    foreach ($domain in $domainsToQuery) {
        try {
            # UAC bit 0x20 (32) = PASSWD_NOTREQD — account may have a blank password
            $users = Get-ADUser -LDAPFilter '(userAccountControl:1.2.840.113556.1.4.803:=32)' -Server $domain -Properties DisplayName, SamAccountName, mail, Enabled, PasswordLastSet, LastLogonDate, WhenCreated, employeeType, extensionAttribute6, Department, DistinguishedName -ErrorAction SilentlyContinue @credParam

            foreach ($user in @($users)) {
                $Results.Add([PSCustomObject]@{
                    Name              = $user.DisplayName
                    SamAccountName    = $user.SamAccountName
                    Email             = $user.mail
                    Enabled           = $user.Enabled
                    Domain            = $domain
                    Department        = $user.Department
                    EmployeeType      = $user.employeeType
                    EA6               = $user.extensionAttribute6
                    PasswordLastSet   = Format-DateForJSON $user.PasswordLastSet
                    LastLogon         = Format-DateForJSON $user.LastLogonDate
                    Created           = Format-DateForJSON $user.WhenCreated
                    DistinguishedName = $user.DistinguishedName
                    RiskLevel         = if ($user.Enabled) { 'High' } else { 'Low' }
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
