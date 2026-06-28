$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5036/api"

function Get-Token {
    Write-Host "Logging in..."
    try {
        $body = @{email="admin@hotel.com"; password="Pa$$w0rd!"} | ConvertTo-Json
        $login = Invoke-RestMethod -Uri "$baseUrl/Auth/login" -Method Post -ContentType "application/json" -Body $body
        return @{Authorization = "Bearer $($login.token)" }
    }
    catch {
        Write-Host "Login failed. Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
            Write-Host "Server Response: $($reader.ReadToEnd())"
        }
        exit 1
    }
}

$headers = Get-Token

function Create-RoomType ($name, $price, $cap, $color, $desc) {
    $body = @{ name=$name; description=$desc; basePrice=$price; capacity=$cap; color=$color } | ConvertTo-Json
    try { return Invoke-RestMethod -Uri "$baseUrl/RoomTypes" -Method Post -Headers $headers -ContentType "application/json" -Body $body }
    catch { 
        $all = Invoke-RestMethod -Uri "$baseUrl/RoomTypes" -Method Get -Headers $headers
        return $all | Where-Object { $_.name -eq $name }
    }
}

function Create-Room ($number, $typeId, $floor) {
    $body = @{ number=$number; roomTypeId=$typeId; floor=$floor } | ConvertTo-Json
    try { return Invoke-RestMethod -Uri "$baseUrl/Rooms" -Method Post -Headers $headers -ContentType "application/json" -Body $body }
    catch { return $null }
}

function Create-Guest ($first, $last, $email, $idNum) {
    $body = @{ firstName=$first; lastName=$last; email=$email; phone="555-0000"; identificationNumber=$idNum } | ConvertTo-Json
    try { return Invoke-RestMethod -Uri "$baseUrl/Guests" -Method Post -Headers $headers -ContentType "application/json" -Body $body }
    catch { 
        $all = Invoke-RestMethod -Uri "$baseUrl/Guests" -Method Get -Headers $headers
        return $all | Where-Object { $_.email -eq $email }
    }
}

function Create-Reservation ($guestId, $roomId, $checkIn, $checkOut, $notes) {
    $body = @{ roomId=$roomId; guestId=$guestId; checkInDate=$checkIn; checkOutDate=$checkOut; adults=2; children=1; notes=$notes } | ConvertTo-Json
    try { return Invoke-RestMethod -Uri "$baseUrl/Reservations" -Method Post -Headers $headers -ContentType "application/json" -Body $body }
    catch { return $null }
}

function Create-Housekeeping ($roomId, $type, $priority, $notes) {
    $body = @{ roomId=$roomId; taskType=$type; priority=$priority; notes=$notes; scheduledFor=(Get-Date).ToString("yyyy-MM-ddTHH:mm:ss") } | ConvertTo-Json
    try { return Invoke-RestMethod -Uri "$baseUrl/Housekeeping" -Method Post -Headers $headers -ContentType "application/json" -Body $body }
    catch { return $null }
}

function Create-Invoice ($resId) {
    $body = @{ reservationId=$resId; paymentMethod="CreditCard"; notes="Factura generada automaticamente" } | ConvertTo-Json
    try { return Invoke-RestMethod -Uri "$baseUrl/Invoices" -Method Post -Headers $headers -ContentType "application/json" -Body $body }
    catch { return $null }
}

Write-Host "--- Seeding 10 Room Types ---"
$colors = @("#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1")
$roomTypes = @()
for ($i=1; $i -le 10; $i++) {
    $rt = Create-RoomType "Tipo Demo $i" (100 + $i*10) ($i % 4 + 1) $colors[$i-1] "Descripcion para el tipo de habitacion demo $i"
    $roomTypes += $rt
}

Write-Host "--- Seeding 10 Rooms ---"
$rooms = @()
for ($i=1; $i -le 10; $i++) {
    $idx = ($i-1) % $roomTypes.Count
    $r = Create-Room ("D$($i+100)") $roomTypes[$idx].id ($i % 5 + 1)
    if ($r) { $rooms += $r }
}
# Fallback if creation fails (already exists)
if ($rooms.Count -lt 10) { $rooms = Invoke-RestMethod -Uri "$baseUrl/Rooms" -Method Get -Headers $headers | Select-Object -First 10 }

Write-Host "--- Seeding 10 Guests ---"
$guests = @()
for ($i=1; $i -le 10; $i++) {
    $g = Create-Guest "Huesped" "Demo $i" "huesped.demo$i@example.com" "ID-DEMO-$i"
    $guests += $g
}

Write-Host "--- Seeding 10 Reservations ---"
$reservations = @()
for ($i=1; $i -le 10; $i++) {
    $gIdx = ($i-1) % $guests.Count
    $rIdx = ($i-1) % $rooms.Count
    $d1 = (Get-Date).AddDays($i - 5).ToString("yyyy-MM-dd")
    $d2 = (Get-Date).AddDays($i).ToString("yyyy-MM-dd")
    $res = Create-Reservation $guests[$gIdx].id $rooms[$rIdx].id $d1 $d2 "Reserva demo numero $i"
    if ($res) { $reservations += $res }
}

Write-Host "--- Seeding 10 Housekeeping Tasks ---"
$taskTypes = @("Cleaning", "Maintenance", "Inspection")
$priorities = @("Normal", "High", "Urgent")
for ($i=1; $i -le 10; $i++) {
    $rIdx = ($i-1) % $rooms.Count
    Create-Housekeeping $rooms[$rIdx].id $taskTypes[$i % 3] $priorities[$i % 3] "Tarea de limpieza demo $i"
}

Write-Host "--- Seeding 10 Invoices ---"
# Use the reservations we just created
for ($i=0; $i -lt [Math]::Min(10, $reservations.Count); $i++) {
    Create-Invoice $reservations[$i].id
}

Write-Host "`nSuccessfully seeded 10 records per module!" -ForegroundColor Green
