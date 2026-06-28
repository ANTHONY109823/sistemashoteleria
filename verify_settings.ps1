$ErrorActionPreference = "Stop"
try {
    $baseUrl = "http://localhost:5036/api"
    
    # 1. Login
    Write-Host "Logging in..."
    $loginBody = '{"email":"admin@hotel.com","password":"Pa$$w0rd!"}'
    $login = Invoke-RestMethod -Uri "$baseUrl/Auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $login.token
    $headers = @{Authorization = "Bearer $token" }
    Write-Host "Token obtained."

    # 2. Get Settings
    Write-Host "Fetching current settings..."
    $settings = Invoke-RestMethod -Uri "$baseUrl/Settings" -Method Get -Headers $headers
    Write-Host "Current Currency: $($settings.currencySymbol)"

    # 3. Update Settings
    Write-Host "Updating Currency Symbol to '€'..."
    $settings.currencySymbol = "€"
    $settings.currency = "EUR"
    # Fix Date Serialization for ASP.NET Core
    $settings.createdAt = [DateTime]$settings.createdAt | Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    $settings.updatedAt = [DateTime]$settings.updatedAt | Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

    # Create body properly
    $updateBody = $settings | ConvertTo-Json -Depth 10
    Write-Host "JSON Body: $updateBody"
    
    
    $updated = Invoke-RestMethod -Uri "$baseUrl/Settings" -Method Put -ContentType "application/json; charset=utf-8" -Body $updateBody -Headers $headers
    Write-Host "Update response: $($updated.currencySymbol)"

    # 4. Verify Persistence
    Write-Host "Verifying persistence..."
    $newSettings = Invoke-RestMethod -Uri "$baseUrl/Settings" -Method Get -Headers $headers
    
    if ($newSettings.currencySymbol -eq "€") {
        Write-Host "SUCCESS: Settings updated and persisted!" -ForegroundColor Green
    }
    else {
        throw "Settings did not persist. Expected '€', got '$($newSettings.currencySymbol)'"
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    exit 1
}
