$ErrorActionPreference = "Stop"
try {
    $baseUrl = "http://localhost:5036/api"
    
    # 1. Login
    Write-Host "Logging in..."
    $loginBody = '{"email":"admin@hotel.com","password":"Pa$$w0rd!"}'
    $login = Invoke-RestMethod -Uri "$baseUrl/Auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $login.token
    $headers = @{Authorization = "Bearer $token"}
    Write-Host "Token obtained."

    # 2. Create Guest
    Write-Host "Creating Guest..."
    $guestBody = '{"firstName":"Para","lastName":"Dox","email":"para.dox@test.com","phone":"1234567890","identificationNumber":"ID123"}'
    $guest = Invoke-RestMethod -Uri "$baseUrl/Guests" -Method Post -ContentType "application/json" -Body $guestBody -Headers $headers
    Write-Host "Guest Used: $($guest.id)"

    # 3. Get Room
    Write-Host "Fetching Rooms..."
    $rooms = Invoke-RestMethod -Uri "$baseUrl/Rooms" -Method Get -Headers $headers
    if ($rooms.Count -eq 0) { throw "No rooms found!" }
    $room = $rooms | Select-Object -First 1
    Write-Host "Room Selected: $($room.id) (Number: $($room.number))"

    # 4. Create Reservation
    Write-Host "Creating Reservation..."
    $checkIn = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    $checkOut = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
    
    $resBody = @{
        guestId = $guest.id
        roomId = $room.id
        checkInDate = $checkIn
        checkOutDate = $checkOut
        status = 0 # Pending/Confirmed
    } | ConvertTo-Json

    $reservation = Invoke-RestMethod -Uri "$baseUrl/Reservations" -Method Post -ContentType "application/json" -Body $resBody -Headers $headers
    Write-Host "SUCCESS: Reservation Created! ID: $($reservation.id)"
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    exit 1
}
