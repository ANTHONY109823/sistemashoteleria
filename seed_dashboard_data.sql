-- SEED DATA FOR DASHBOARD AND STATS (CORRECTED V3)
-- This script populates the database with realistic data for testing charts and stats.

SET NOCOUNT ON;

-- 1. Create RoomTypes
IF NOT EXISTS (SELECT 1 FROM RoomTypes)
BEGIN
    INSERT INTO RoomTypes (Id, Name, Description, BasePrice, Capacity, CreatedAt)
    VALUES 
    (NEWID(), 'Individual', 'Habitacion para una persona', 50.00, 1, GETUTCDATE()),
    (NEWID(), 'Doble Standard', 'Cama matrimonial o dos camas individuales', 85.00, 2, GETUTCDATE()),
    (NEWID(), 'Doble Deluxe', 'Habitacion amplia con vista al mar', 120.00, 2, GETUTCDATE()),
    (NEWID(), 'Suite Familiar', 'Dos ambientes para familias', 200.00, 4, GETUTCDATE()),
    (NEWID(), 'Suite Presidencial', 'Maximo lujo y confort', 450.00, 2, GETUTCDATE());
END

-- 2. Create Rooms
DECLARE @IndividualId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM RoomTypes WHERE Name = 'Individual');
DECLARE @DobleStdId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM RoomTypes WHERE Name = 'Doble Standard');
DECLARE @DobleDlxId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM RoomTypes WHERE Name = 'Doble Deluxe');
DECLARE @SuiteFamId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM RoomTypes WHERE Name = 'Suite Familiar');
DECLARE @SuitePreId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM RoomTypes WHERE Name = 'Suite Presidencial');

IF (SELECT COUNT(*) FROM Rooms) < 5
BEGIN
    INSERT INTO Rooms (Id, Number, RoomTypeId, Floor, Status, CreatedAt, IsActive)
    VALUES
    (NEWID(), '101', @IndividualId, 1, 0, GETUTCDATE(), 1),
    (NEWID(), '102', @IndividualId, 1, 0, GETUTCDATE(), 1),
    (NEWID(), '103', @DobleStdId, 1, 0, GETUTCDATE(), 1),
    (NEWID(), '104', @DobleStdId, 1, 0, GETUTCDATE(), 1),
    (NEWID(), '201', @DobleStdId, 2, 0, GETUTCDATE(), 1),
    (NEWID(), '202', @DobleDlxId, 2, 0, GETUTCDATE(), 1),
    (NEWID(), '203', @DobleDlxId, 2, 0, GETUTCDATE(), 1),
    (NEWID(), '204', @SuiteFamId, 2, 0, GETUTCDATE(), 1),
    (NEWID(), '301', @SuiteFamId, 3, 0, GETUTCDATE(), 1),
    (NEWID(), '302', @SuiteFamId, 3, 0, GETUTCDATE(), 1),
    (NEWID(), '303', @SuitePreId, 3, 0, GETUTCDATE(), 1),
    (NEWID(), '304', @SuitePreId, 3, 0, GETUTCDATE(), 1),
    (NEWID(), '401', @IndividualId, 4, 0, GETUTCDATE(), 1),
    (NEWID(), '402', @DobleStdId, 4, 0, GETUTCDATE(), 1),
    (NEWID(), '403', @DobleDlxId, 4, 0, GETUTCDATE(), 1),
    (NEWID(), '404', @SuiteFamId, 4, 0, GETUTCDATE(), 1),
    (NEWID(), '501', @IndividualId, 5, 0, GETUTCDATE(), 1),
    (NEWID(), '502', @DobleStdId, 5, 0, GETUTCDATE(), 1),
    (NEWID(), '503', @DobleDlxId, 5, 0, GETUTCDATE(), 1),
    (NEWID(), '504', @SuiteFamId, 5, 0, GETUTCDATE(), 1);
END

-- 3. Create Guests
IF (SELECT COUNT(*) FROM Guests) < 5
BEGIN
    INSERT INTO Guests (Id, FirstName, LastName, Email, Phone, IdentificationNumber, Address, CreatedAt, IsActive)
    VALUES
    (NEWID(), 'Juan', 'Perez', 'juan.perez@email.com', '987654321', '11111111', 'Av. Siempre Viva 123', GETUTCDATE(), 1),
    (NEWID(), 'Maria', 'Garcia', 'maria.garcia@email.com', '987654322', '22222222', 'Calle Luna 456', GETUTCDATE(), 1),
    (NEWID(), 'Carlos', 'Lopez', 'carlos.lopez@email.com', '987654323', '33333333', 'Av. Sol 789', GETUTCDATE(), 1),
    (NEWID(), 'Ana', 'Martinez', 'ana.martinez@email.com', '987654324', '44444444', 'Jr. Pizarro 101', GETUTCDATE(), 1),
    (NEWID(), 'Luis', 'Sanchez', 'luis.sanchez@email.com', '987654325', '55555555', 'Av. Larco 555', GETUTCDATE(), 1),
    (NEWID(), 'Elena', 'Rodriguez', 'elena.rod@email.com', '987654326', '66666666', 'Calle Real 222', GETUTCDATE(), 1),
    (NEWID(), 'Jorge', 'Gomez', 'jorge.gomez@email.com', '987654327', '77777777', 'Av. Arequipa 888', GETUTCDATE(), 1),
    (NEWID(), 'Sofia', 'Fernandez', 'sofia.fer@email.com', '987654328', '88888888', 'Jr. Junin 444', GETUTCDATE(), 1),
    (NEWID(), 'David', 'Diaz', 'david.diaz@email.com', '987654329', '99999999', 'Av. Brasil 111', GETUTCDATE(), 1),
    (NEWID(), 'Lucia', 'Ruiz', 'lucia.ruiz@email.com', '987654330', '00000001', 'Calle Lima 777', GETUTCDATE(), 1),
    (NEWID(), 'Roberto', 'Hernandez', 'roberto@email.com', '987654331', '10101010', 'Calle Cusco 123', GETUTCDATE(), 1),
    (NEWID(), 'Patricia', 'Jimenez', 'patricia@email.com', '987654332', '20202020', 'Av. Tacna 456', GETUTCDATE(), 1),
    (NEWID(), 'Fernando', 'Moreno', 'fer@email.com', '987654333', '30303030', 'Jr. Huandoy 789', GETUTCDATE(), 1),
    (NEWID(), 'Claudia', 'Alvarez', 'claudia@email.com', '987654334', '40404040', 'Calle Mantaro 101', GETUTCDATE(), 1),
    (NEWID(), 'Victor', 'Romero', 'victor@email.com', '987654335', '50505050', 'Av. Grau 555', GETUTCDATE(), 1),
    (NEWID(), 'Rosa', 'Vargas', 'rosa@email.com', '987654336', '60606060', 'Jr. Ica 222', GETUTCDATE(), 1),
    (NEWID(), 'Miguel', 'Castro', 'miguel@email.com', '987654337', '70707070', 'Calle Libertad 888', GETUTCDATE(), 1),
    (NEWID(), 'Isabel', 'Ortega', 'isabel@email.com', '987654338', '80808080', 'Av. Larco 444', GETUTCDATE(), 1),
    (NEWID(), 'Gabriel', 'Nunez', 'gabriel@email.com', '987654339', '90909090', 'Jr. Union 111', GETUTCDATE(), 1),
    (NEWID(), 'Carmen', 'Medina', 'carmen@email.com', '987654340', '01010101', 'Av. Aviacion 777', GETUTCDATE(), 1);
END

-- 4. Create Reservations
IF (SELECT COUNT(*) FROM Reservations) < 5
BEGIN
    DECLARE @GuestCursor CURSOR;
    DECLARE @GuestId UNIQUEIDENTIFIER;
    DECLARE @RoomCursor CURSOR;
    DECLARE @RoomId UNIQUEIDENTIFIER;
    DECLARE @Counter INT = 1;
    DECLARE @BasePrice DECIMAL(18,2);

    SET @GuestCursor = CURSOR FOR SELECT Id FROM Guests;
    OPEN @GuestCursor;

    SET @RoomCursor = CURSOR FOR SELECT Id FROM Rooms;
    OPEN @RoomCursor;

    FETCH NEXT FROM @GuestCursor INTO @GuestId;
    FETCH NEXT FROM @RoomCursor INTO @RoomId;

    WHILE @@FETCH_STATUS = 0 AND @Counter <= 40
    BEGIN
        SELECT @BasePrice = rt.BasePrice FROM RoomTypes rt JOIN Rooms r ON r.RoomTypeId = rt.Id WHERE r.Id = @RoomId;

        DECLARE @Status INT;
        DECLARE @CI DATE;
        DECLARE @CO DATE;

        IF @Counter <= 15 -- CheckedOut
        BEGIN
            SET @Status = 3; -- CheckedOut
            SET @CI = DATEADD(day, -(@Counter + 5), GETUTCDATE());
            SET @CO = DATEADD(day, -(@Counter + 2), GETUTCDATE());
        END
        ELSE IF @Counter <= 25 -- CheckedIn
        BEGIN
            SET @Status = 2; -- CheckedIn
            SET @CI = DATEADD(day, -1, GETUTCDATE());
            SET @CO = DATEADD(day, 2, GETUTCDATE());
            UPDATE Rooms SET Status = 1 WHERE Id = @RoomId; 
        END
        ELSE IF @Counter <= 35 -- Confirmed
        BEGIN
            SET @Status = 1; -- Confirmed
            SET @CI = DATEADD(day, (@Counter - 20), GETUTCDATE());
            SET @CO = DATEADD(day, (@Counter - 20 + 3), GETUTCDATE());
        END
        ELSE -- Cancelled
        BEGIN
            SET @Status = 4; -- Cancelled
            SET @CI = DATEADD(day, -2, GETUTCDATE());
            SET @CO = DATEADD(day, 1, GETUTCDATE());
        END

        INSERT INTO Reservations (Id, GuestId, RoomId, CheckInDate, CheckOutDate, Adults, Children, TotalPrice, Status, Notes, CreatedAt)
        VALUES (NEWID(), @GuestId, @RoomId, @CI, @CO, 2, 0, @BasePrice * 3, @Status, 'Seeded data', GETUTCDATE());

        SET @Counter = @Counter + 1;
        FETCH NEXT FROM @GuestCursor INTO @GuestId;
        IF @@FETCH_STATUS <> 0 BEGIN CLOSE @GuestCursor; OPEN @GuestCursor; FETCH NEXT FROM @GuestCursor INTO @GuestId; END
        FETCH NEXT FROM @RoomCursor INTO @RoomId;
        IF @@FETCH_STATUS <> 0 BEGIN CLOSE @RoomCursor; OPEN @RoomCursor; FETCH NEXT FROM @RoomCursor INTO @RoomId; END
    END

    CLOSE @GuestCursor;
    DEALLOCATE @GuestCursor;
    CLOSE @RoomCursor;
    DEALLOCATE @RoomCursor;
END

-- 5. Create Invoices
IF NOT EXISTS (SELECT 1 FROM Invoices)
BEGIN
    INSERT INTO Invoices (Id, ReservationId, GuestId, InvoiceNumber, SubTotal, TaxRate, TaxAmount, TotalAmount, PaymentMethod, PaymentStatus, PaidAt, CreatedAt, Notes)
    SELECT 
        NEWID(), 
        r.Id, 
        r.GuestId, 
        'F-' + REPLACE(STR(ROW_NUMBER() OVER(ORDER BY r.Id), 5), ' ', '0'),
        r.TotalPrice / 1.18,
        0.18,
        r.TotalPrice - (r.TotalPrice / 1.18),
        r.TotalPrice,
        0, -- Cash
        1, -- Paid
        COALESCE(r.CheckOutDate, GETUTCDATE()),
        GETUTCDATE(),
        'Seeded Invoice'
    FROM Reservations r
    WHERE r.Status IN (2, 3);

    INSERT INTO InvoiceItems (Id, InvoiceId, Description, Quantity, UnitPrice, Total, CreatedAt)
    SELECT NEWID(), i.Id, 'Estadia de Hotel', 1, i.SubTotal, i.SubTotal, GETUTCDATE() FROM Invoices i;
END

-- 6. Create HousekeepingTasks
IF NOT EXISTS (SELECT 1 FROM HousekeepingTasks)
BEGIN
    INSERT INTO HousekeepingTasks (Id, RoomId, Notes, TaskType, Priority, Status, ScheduledFor, CreatedAt, AssignedToUserName)
    SELECT TOP 20 NEWID(), Id, 'Limpieza rutinaria', 0, 1, 0, GETUTCDATE(), GETUTCDATE(), 'Admin' FROM Rooms;
END

-- 7. Create AuditLogs
IF (SELECT COUNT(*) FROM AuditLogs) < 10
BEGIN
    DECLARE @AdminId UNIQUEIDENTIFIER = '15f080b4-dd9e-439b-9ec1-7b191051c054';
    INSERT INTO AuditLogs (Id, UserId, UserName, Action, EntityType, EntityId, Timestamp, IpAddress)
    VALUES
    (NEWID(), CAST(@AdminId AS NVARCHAR(100)), 'admin@hotel.com', 'LOGIN', 'User', CAST(@AdminId AS NVARCHAR(100)), GETUTCDATE(), '127.0.0.1'),
    (NEWID(), CAST(@AdminId AS NVARCHAR(100)), 'admin@hotel.com', 'SEED_DATA', 'Database', 'SYSTEM', GETUTCDATE(), '127.0.0.1');
END

SELECT 'Database Seeded Successfully' as Message;
