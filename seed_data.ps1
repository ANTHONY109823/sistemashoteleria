$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5036/api"

function Get-Token {
    Write-Host "Logging in..."
    try {
        $login = Invoke-RestMethod -Uri "$baseUrl/Auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@hotel.com","password":"Pa$$w0rd!"}'
        return @{Authorization = "Bearer $($login.token)" }
    }
    catch {
        Write-Error "Login failed. Ensure the API is running."
        exit 1
    }
}

function Create-RoomType ($headers, $name, $price, $cap, $color, $desc) {
    Write-Host "Creating RoomType: $name"
    $body = @{
        name        = $name
        description = $desc
        basePrice   = $price
        capacity    = $cap
        color       = $color
    } | ConvertTo-Json
    
    try {
        return Invoke-RestMethod -Uri "$baseUrl/RoomTypes" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    }
    catch {
        Write-Warning "Failed to create RoomType $name (might already exist): $($_.Exception.Message)"
        # Try to fetch it to return the ID
        $all = Invoke-RestMethod -Uri "$baseUrl/RoomTypes" -Method Get -Headers $headers
        return $all | Where-Object { $_.name -eq $name }
    }
}

function Create-Room ($headers, $number, $typeId, $floor) {
    Write-Host "Creating Room: $number"
    $body = @{
        number     = $number
        roomTypeId = $typeId
        floor      = $floor
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/Rooms" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    }
    catch {
        Write-Warning "Failed to create Room ${number}: $($_.Exception.Message)"
    }
}

function Create-Guest ($headers, $first, $last, $email, $idNum) {
    Write-Host "Creating Guest: $first $last"
    $body = @{
        firstName            = $first
        lastName             = $last
        email                = $email
        phone                = "555-0100"
        identificationNumber = $idNum
    } | ConvertTo-Json
    
    try {
        return Invoke-RestMethod -Uri "$baseUrl/Guests" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    }
    catch {
        Write-Warning "Failed to create Guest ${first} ${last}: $($_.Exception.Message)"
        $all = Invoke-RestMethod -Uri "$baseUrl/Guests" -Method Get -Headers $headers
        return $all | Where-Object { $_.email -eq $email }
    }
}

function Create-Reservation ($headers, $guestId, $roomId, $checkIn, $checkOut, $status, $notes) {
    Write-Host "Creating Reservation for Guest $guestId in Room $roomId"
    $body = @{
        roomId       = $roomId
        guestId      = $guestId
        checkInDate  = $checkIn
        checkOutDate = $checkOut
        adults       = 1
        children     = 0
        notes        = $notes
    } | ConvertTo-Json
    
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/Reservations" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        return $res
    }
    catch {
        Write-Warning "Failed to create Reservation: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
            Write-Host "Response: $($reader.ReadToEnd())"
        }
    }
}

$headers = Get-Token

# 1. Room Types
$typeSingle = Create-RoomType $headers "Individual" 50 1 "#3b82f6" "Habitación simple para una persona"
$typeDouble = Create-RoomType $headers "Doble" 80 2 "#10b981" "Habitación con dos camas o cama doble"
$typeSuite = Create-RoomType $headers "Suite" 150 4 "#f59e0b" "Suite de lujo con vista al mar"

# 2. Rooms
if ($typeSingle) {
    Create-Room $headers "101" $typeSingle.id 1
    Create-Room $headers "102" $typeSingle.id 1
}
if ($typeDouble) {
    Create-Room $headers "201" $typeDouble.id 2
    Create-Room $headers "202" $typeDouble.id 2
    Create-Room $headers "203" $typeDouble.id 2
}
if ($typeSuite) {
    Create-Room $headers "301" $typeSuite.id 3
}

# 3. Guests
$guest1 = Create-Guest $headers "Juan" "Perez" "juan.perez@email.com" "ID1001"
$guest2 = Create-Guest $headers "Maria" "Gonzalez" "maria.gonzalez@email.com" "ID1002"
$guest3 = Create-Guest $headers "Carlos" "Rodriguez" "carlos.rodriguez@email.com" "ID1003"

# 4. Reservations
# Past (Last month)
if ($guest1 -and $typeSingle) {
    $rooms = Invoke-RestMethod -Uri "$baseUrl/Rooms" -Method Get -Headers $headers
    $r101 = $rooms | Where-Object { $_.number -eq "101" }
    if ($r101) {
        # Past (Within last 7 days)
        $d1 = (Get-Date).AddDays(-4).ToString("yyyy-MM-dd")
        $d2 = (Get-Date).AddDays(-2).ToString("yyyy-MM-dd")
        $res = Create-Reservation $headers $guest1.id $r101.id $d1 $d2 2 "Estancia reciente (hace 4 dias)"
    }
}

# Current (Today)
if ($guest2 -and $typeDouble) {
    $rooms = Invoke-RestMethod -Uri "$baseUrl/Rooms" -Method Get -Headers $headers
    $r201 = $rooms | Where-Object { $_.number -eq "201" }
    if ($r201) {
        $d1 = (Get-Date).ToString("yyyy-MM-dd")
        $d2 = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
        $res = Create-Reservation $headers $guest2.id $r201.id $d1 $d2 0 "Estancia actual (Check-in pendiente)"
        
        # Simulate CheckIn
        # Invoke-RestMethod -Uri "$baseUrl/Reservations/$($res.id)/checkin" -Method Post -Headers $headers
    }
}

# Future (Next Month)
if ($guest3 -and $typeSuite) {
    $rooms = Invoke-RestMethod -Uri "$baseUrl/Rooms" -Method Get -Headers $headers
    $r301 = $rooms | Where-Object { $_.number -eq "301" }
    if ($r301) {
        $d1 = (Get-Date).AddDays(15).ToString("yyyy-MM-dd")
        $d2 = (Get-Date).AddDays(20).ToString("yyyy-MM-dd")
        Create-Reservation $headers $guest3.id $r301.id $d1 $d2 0 "Reserva futura"
    }
}

Write-Host "Seeding Completed!" -ForegroundColor Green
