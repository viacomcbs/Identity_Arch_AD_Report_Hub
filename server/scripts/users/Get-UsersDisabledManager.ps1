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
            # Enabled users that have a Manager attribute set
            $users = Get-ADUser `
                -LDAPFilter '(&(objectClass=user)(manager=*)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))' `
                -Server $domain `
                -Properties DisplayName, SamAccountName, mail, Manager, `
                    Department, Title, employeeType, extensionAttribute6, `
                    WhenCreated, LastLogonDate, DistinguishedName -ErrorAction SilentlyContinue

            foreach ($user in @($users)) {
                try {
                    $manager = Get-ADUser -Identity $user.Manager -Server $domain `
                        -Properties DisplayName, SamAccountName, Enabled, mail -ErrorAction SilentlyContinue

                    if ($manager -and -not $manager.Enabled) {
                        $Results.Add([PSCustomObject]@{
                            Name              = $user.DisplayName
                            SamAccountName    = $user.SamAccountName
                            Email             = $user.mail
                            Department        = $user.Department
                            Title             = $user.Title
                            EmployeeType      = $user.employeeType
                            EA6               = $user.extensionAttribute6
                            Domain            = $domain
                            ManagerName       = $manager.DisplayName
                            ManagerSam        = $manager.SamAccountName
                            ManagerEmail      = $manager.mail
                            ManagerEnabled    = $manager.Enabled
                            LastLogon         = Format-DateForJSON $user.LastLogonDate
                            Created           = Format-DateForJSON $user.WhenCreated
                            DistinguishedName = $user.DistinguishedName
                        })
                    }
                } catch { }
            }
        } catch { }
    }

    @($Results) | ConvertTo-Json -Depth 3
}
catch {
    @{ Error = $_.Exception.Message } | ConvertTo-Json
    exit 1
}
