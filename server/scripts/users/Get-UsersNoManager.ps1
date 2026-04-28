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
    $WarningPreference = 'SilentlyContinue'

    $anchorDomain = if ($TargetDomain) { $TargetDomain } else { (Get-ADDomain).DNSRoot }
    $forest = Get-ADForest -Server $anchorDomain -ErrorAction Stop
    $domainsToQuery = if ($TargetDomain) { @($TargetDomain) } else { @($forest.Domains) }

    $Results = New-Object System.Collections.Generic.List[PSObject]

    foreach ($domain in $domainsToQuery) {
        try {
            # Enabled users with no Manager attribute — no active management chain
            $users = Get-ADUser `
                -LDAPFilter '(&(objectClass=user)(!(manager=*))(!(userAccountControl:1.2.840.113556.1.4.803:=2)))' `
                -Server $domain `
                -Properties DisplayName, SamAccountName, mail, Department, Title, `
                    employeeType, extensionAttribute6, WhenCreated, LastLogonDate, `
                    DistinguishedName -ErrorAction SilentlyContinue

            foreach ($user in @($users)) {
                $Results.Add([PSCustomObject]@{
                    Name              = $user.DisplayName
                    SamAccountName    = $user.SamAccountName
                    Email             = $user.mail
                    Department        = $user.Department
                    Title             = $user.Title
                    EmployeeType      = $user.employeeType
                    EA6               = $user.extensionAttribute6
                    Domain            = $domain
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
