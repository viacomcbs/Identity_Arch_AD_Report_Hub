param()

try {
    Import-Module ActiveDirectory -ErrorAction Stop
    $credParam = if ($global:PSADCredential) { @{Credential = $global:PSADCredential} } else { @{} }
    
    # Fetch all users with password never expires (no limit)
    $Users = Get-ADUser -Filter { PasswordNeverExpires -eq $true -and Enabled -eq $true } -Properties DisplayName, EmailAddress, Department, Title, PasswordLastSet, PasswordNeverExpires @credParam
    
    $Results = foreach ($User in $Users) {
        [PSCustomObject]@{
            DisplayName          = $User.DisplayName
            SamAccountName       = $User.SamAccountName
            Email                = $User.EmailAddress
            Department           = $User.Department
            Title                = $User.Title
            PasswordNeverExpires = $User.PasswordNeverExpires
            PasswordLastSet      = $User.PasswordLastSet
            DistinguishedName    = $User.DistinguishedName
        }
    }
    
    @($Results) | ConvertTo-Json -Depth 3
}
catch {
    @{ Error = $_.Exception.Message } | ConvertTo-Json
    exit 1
}
