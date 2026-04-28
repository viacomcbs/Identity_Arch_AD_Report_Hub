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

# Map Win32 replication error codes to human-readable messages
function Get-ReplicationErrorMessage {
    param([int]$ErrorCode)
    $errors = @{
        0     = 'Success'
        1256  = 'The remote system is not available'
        1722  = 'The RPC server is unavailable'
        1753  = 'No more endpoints available from the endpoint mapper'
        1396  = 'Logon failure: the target account name is incorrect'
        1908  = 'Could not find the domain controller for this domain'
        5     = 'Access is denied'
        8240  = 'There is no such object on the server'
        8452  = 'The naming context is in the process of being removed'
        8453  = 'Replication access was denied'
        8457  = 'The destination server is currently rejecting replication requests'
        8524  = 'The DSA operation is unable to proceed because of a DNS lookup failure'
        8545  = 'Replication update could not be applied because either the source or the destination has not yet received information about a recent cross-domain move'
        8606  = 'Insufficient attributes were given to create an object'
        8614  = 'The Active Directory Domain Services cannot replicate with this server because the time since the last replication with this server has exceeded the tombstone lifetime'
        8461  = 'The replication operation was preempted'
    }
    if ($errors.ContainsKey($ErrorCode)) { return $errors[$ErrorCode] }
    return "Error code $ErrorCode"
}

try {
    Import-Module ActiveDirectory -ErrorAction Stop
    $WarningPreference = 'SilentlyContinue'

    $anchorDomain = if ($TargetDomain) { $TargetDomain } else { (Get-ADDomain).DNSRoot }
    $forest = Get-ADForest -Server $anchorDomain -ErrorAction Stop
    $domainsToQuery = if ($TargetDomain) { @($TargetDomain) } else { @($forest.Domains) }

    $Results = New-Object System.Collections.Generic.List[PSObject]
    $Now = Get-Date

    foreach ($domain in $domainsToQuery) {
        try {
            $DCs = Get-ADDomainController -Filter * -Server $domain -ErrorAction SilentlyContinue

            foreach ($DC in @($DCs)) {
                try {
                    $Partners = Get-ADReplicationPartnerMetadata -Target $DC.HostName `
                        -ErrorAction SilentlyContinue

                    foreach ($Partner in @($Partners)) {
                        $lastSuccess       = $Partner.LastReplicationSuccess
                        $lastAttempt       = $Partner.LastReplicationAttempt
                        $errorCode         = [int]$Partner.LastReplicationResult
                        $consecutiveFails  = [int]$Partner.ConsecutiveReplicationFailures
                        $hoursSinceSuccess = $null
                        $replicationStatus = 'Unknown'

                        if ($lastSuccess -and $lastSuccess -ne [DateTime]::MinValue) {
                            $hoursSinceSuccess = [math]::Round(($Now - $lastSuccess).TotalHours, 1)
                            $replicationStatus = switch ($true) {
                                { $errorCode -ne 0 }            { 'Failed';  break }
                                { $hoursSinceSuccess -gt 24 }   { 'Overdue'; break }
                                { $hoursSinceSuccess -gt 12 }   { 'Warning'; break }
                                default                          { 'Healthy' }
                            }
                        } elseif ($errorCode -ne 0) {
                            $replicationStatus = 'Failed'
                        }

                        # Extract partner site from the partner DN
                        # CN=NTDS Settings,CN=<DCName>,CN=<SiteName>,CN=Sites,CN=Configuration,...
                        $partnerSite = 'Unknown'
                        if ($Partner.Partner -match 'CN=NTDS Settings,CN=[^,]+,CN=([^,]+),CN=Sites') {
                            $partnerSite = $Matches[1]
                        }

                        $Results.Add([PSCustomObject]@{
                            Domain                  = $domain
                            DCName                  = $DC.HostName
                            Site                    = $DC.Site
                            PartnerDC               = $DC.HostName  # kept for symmetry
                            PartnerName             = $Partner.Partner -replace '^CN=NTDS Settings,CN=([^,]+),.+$', '$1'
                            PartnerSite             = $partnerSite
                            Partition               = $Partner.Partition
                            LastAttempt             = Format-DateForJSON $lastAttempt
                            LastSuccess             = Format-DateForJSON $lastSuccess
                            HoursSinceLastSuccess   = $hoursSinceSuccess
                            LastResultCode          = $errorCode
                            LastResultMessage       = Get-ReplicationErrorMessage $errorCode
                            ConsecutiveFailures     = $consecutiveFails
                            ReplicationStatus       = $replicationStatus
                            IsOverdue               = ($hoursSinceSuccess -gt 24 -or $errorCode -ne 0)
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
