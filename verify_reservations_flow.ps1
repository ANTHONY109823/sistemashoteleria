$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5036/api"

function Get-Token {
    $login = Invoke-RestMethod -Uri "$baseUrl/Auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@hotel.com","password":"Pa$$w0rd!"}'
    return @{Authorization = "Bearer $($login.token)" }
}

try {
    $headers = Get-Token
    
    # 1. Get/Create Guest
    Write-Host "Getting Guests..."
    $guests = Invoke-RestMethod -Uri "$baseUrl/Guests" -Method Get -Headers $headers
    $guestId = $guests[0].id
    if (-not $guestId) {
        Write-Host "No guests found. Creating one..."
        $newGuest = Invoke-RestMethod -Uri "$baseUrl/Guests" -Method Post -Headers $headers -ContentType "application/json" -Body '{"firstName":"Test","lastName":"Guest","email":"test@guest.com","phone":"123","identificationNumber":"ID123"}'
        $guestId = $newGuest.id
    }
    Write-Host "Using Guest ID: $guestId"

    # 2. Get Room
    Write-Host "Getting Rooms..."
    $rooms = Invoke-RestMethod -Uri "$baseUrl/Rooms" -Method Get -Headers $headers
    $roomId = $rooms[0].id
    Write-Host "Using Room ID: $roomId ($($rooms[0].number))"

    # 3. Create Reservation
    Write-Host "Creating Reservation..."
    $checkIn = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    $checkOut = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    
    $body = @{
        roomId       = $roomId
        guestId      = $guestId
        checkInDate  = $checkIn
        checkOutDate = $checkOut
        adults       = 2
        children     = 0
        notes        = "Auto-test reservation"
    } | ConvertTo-Json
    
    $res = Invoke-RestMethod -Uri "$baseUrl/Reservations" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    Write-Host "Reservation Created! ID: $($res.id) - Status: $($res.status)"

    # 4. Verify
    if ($res.id) {
        Write-Host "SUCCESS: Reservation flow verified." -ForegroundColor Green
    }
    else {
        throw "Reservation creation returned no ID."
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
    exit 1
}
