-- SEED EXTRA 10 RECORDS FOR EACH MODULE
SET NOCOUNT ON;

-- 1. Create 10 Extra RoomTypes
DECLARE @i INT = 1;
WHILE @i <= 10
BEGIN
    INSERT INTO RoomTypes (Id, Name, Description, BasePrice, Capacity, CreatedAt, IsActive)
    VALUES (NEWID(), 'Extra Type ' + CAST(@i AS VARCHAR), 'Description for extra type ' + CAST(@i AS VARCHAR), 100 + (@i*25), 1 + (@i % 4), GETUTCDATE(), 1);
    SET @i = @i + 1;
END

-- 2. Create 10 Extra Rooms
SET @i = 1;
DECLARE @TypeCursor CURSOR;
DECLARE @TypeId UNIQUEIDENTIFIER;
SET @TypeCursor = CURSOR FOR SELECT Id FROM RoomTypes WHERE Name LIKE 'Extra Type%';
OPEN @TypeCursor;

WHILE @i <= 10
BEGIN
    FETCH NEXT FROM @TypeCursor INTO @TypeId;
    IF @@FETCH_STATUS <> 0 BEGIN CLOSE @TypeCursor; OPEN @TypeCursor; FETCH NEXT FROM @TypeCursor INTO @TypeId; END
    
    INSERT INTO Rooms (Id, Number, RoomTypeId, Floor, Status, CreatedAt, IsActive)
    VALUES (NEWID(), 'X-' + CAST(@i + 500 AS VARCHAR), @TypeId, (@i % 5) + 1, 0, GETUTCDATE(), 1);
    SET @i = @i + 1;
END
CLOSE @TypeCursor;
DEALLOCATE @TypeCursor;

-- 3. Create 10 Extra Guests
SET @i = 1;
WHILE @i <= 10
BEGIN
    INSERT INTO Guests (Id, FirstName, LastName, Email, Phone, IdentificationNumber, Address, CreatedAt, IsActive)
    VALUES (NEWID(), 'Guest-' + CAST(@i AS VARCHAR), 'Extra-' + CAST(@i AS VARCHAR), 'guest.extra' + CAST(@i AS VARCHAR) + '@demo.com', '9000000' + CAST(@i AS VARCHAR), 'ID-X' + CAST(@i AS VARCHAR), 'Extra Address ' + CAST(@i AS VARCHAR), GETUTCDATE(), 1);
    SET @i = @i + 1;
END

-- 4. Create 10 Extra Reservations
SET @i = 1;
DECLARE @GuestCursor CURSOR;
DECLARE @GuestId UNIQUEIDENTIFIER;
DECLARE @RoomCursor CURSOR;
DECLARE @RoomId UNIQUEIDENTIFIER;

SET @GuestCursor = CURSOR FOR SELECT Id FROM Guests WHERE Email LIKE 'guest.extra%';
OPEN @GuestCursor;
SET @RoomCursor = CURSOR FOR SELECT Id FROM Rooms WHERE Number LIKE 'X-%';
OPEN @RoomCursor;

WHILE @i <= 10
BEGIN
    FETCH NEXT FROM @GuestCursor INTO @GuestId;
    FETCH NEXT FROM @RoomCursor INTO @RoomId;
    
    DECLARE @BasePrice DECIMAL(18,2) = (SELECT rt.BasePrice FROM RoomTypes rt JOIN Rooms r ON r.RoomTypeId = rt.Id WHERE r.Id = @RoomId);
    
    -- Statuses: 1 (Confirmed), 2 (CheckedIn), 3 (CheckedOut)
    DECLARE @ResStatus INT = (@i % 3) + 1; 
    DECLARE @DaysShift INT = (@i - 5) * 3;
    
    INSERT INTO Reservations (Id, GuestId, RoomId, CheckInDate, CheckOutDate, Adults, Children, TotalPrice, Status, Notes, CreatedAt)
    VALUES (NEWID(), @GuestId, @RoomId, DATEADD(day, @DaysShift, GETUTCDATE()), DATEADD(day, @DaysShift + 3, GETUTCDATE()), 2, 0, @BasePrice * 3, @ResStatus, 'Extra seeded reservation ' + CAST(@i AS VARCHAR), GETUTCDATE());
    
    -- If CheckedIn, update room status
    IF @ResStatus = 2 UPDATE Rooms SET Status = 1 WHERE Id = @RoomId;

    SET @i = @i + 1;
END
CLOSE @GuestCursor;
DEALLOCATE @GuestCursor;
CLOSE @RoomCursor;
DEALLOCATE @RoomCursor;

-- 5. Create 10 Extra Invoices
-- Link to the reservations we just created
INSERT INTO Invoices (Id, ReservationId, GuestId, InvoiceNumber, SubTotal, TaxRate, TaxAmount, TotalAmount, PaymentMethod, PaymentStatus, PaidAt, CreatedAt, Notes)
SELECT TOP 10
    NEWID(), 
    r.Id, 
    r.GuestId, 
    'FX-' + REPLACE(STR(ROW_NUMBER() OVER(ORDER BY r.Id), 5), ' ', '0'),
    r.TotalPrice / 1.18,
    0.18,
    r.TotalPrice - (r.TotalPrice / 1.18),
    r.TotalPrice,
    1, -- CreditCard
    1, -- Paid
    GETUTCDATE(),
    GETUTCDATE(),
    'Extra seeded invoice'
FROM Reservations r
WHERE r.Notes LIKE 'Extra seeded reservation%'
ORDER BY r.CreatedAt DESC;

-- 6. Create 10 Extra Housekeeping Tasks
INSERT INTO HousekeepingTasks (Id, RoomId, Notes, TaskType, Priority, Status, ScheduledFor, CreatedAt, AssignedToUserName)
SELECT TOP 10
    NEWID(), 
    Id, 
    'Extra cleaning task', 
    1, -- Maintenance
    2, -- High
    0, -- Pending
    GETUTCDATE(), 
    GETUTCDATE(), 
    'Admin' 
FROM Rooms 
WHERE Number LIKE 'X-%';

-- 7. Create 10 Audit Logs
DECLARE @AdminUserId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AspNetUsers WHERE Email = 'admin@hotel.com');
DECLARE @AdminUserName NVARCHAR(256) = 'admin@hotel.com';

SET @i = 1;
WHILE @i <= 10
BEGIN
    INSERT INTO AuditLogs (Id, UserId, UserName, Action, EntityType, EntityId, Timestamp, IpAddress)
    VALUES (NEWID(), CAST(@AdminUserId AS NVARCHAR(100)), @AdminUserName, 'EXTRA_SEED_ACTION', 'System', 'DATA_POPULATION_' + CAST(@i AS VARCHAR), GETUTCDATE(), '127.0.0.1');
    SET @i = @i+1;
END

-- 8. Create 10 Notifications
SET @i = 1;
WHILE @i <= 10
BEGIN
    INSERT INTO Notifications (Id, Title, Message, Type, IsRead, CreatedAt)
    VALUES (NEWID(), 'Sistema Actualizado', 'Se han agregado nuevos registros de prueba al modulo ' + CAST(@i AS VARCHAR), 0, 0, GETUTCDATE());
    SET @i = @i+1;
END

SELECT 'Added 10 extra records to each module successfully' as Message;
