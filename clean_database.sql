-- Script para limpiar la base de datos
-- Mantiene: Usuario admin, roles, configuración
-- Elimina: Reservas, huéspedes, habitaciones, tipos de habitación, logs

USE MiHoteleriaDB;
GO

-- Deshabilitar constraints temporalmente
ALTER TABLE [Reservations] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Rooms] NOCHECK CONSTRAINT ALL;
GO

-- Limpiar tablas de datos transaccionales
DELETE FROM [Reservations];
DELETE FROM [Guests];
DELETE FROM [Rooms];
DELETE FROM [RoomTypes];
DELETE FROM [AuditLogs];

-- Rehabilitar constraints
ALTER TABLE [Reservations] CHECK CONSTRAINT ALL;
ALTER TABLE [Rooms] CHECK CONSTRAINT ALL;
GO

-- Resetear identity seeds si es necesario
DBCC CHECKIDENT ('[Reservations]', RESEED, 0);
DBCC CHECKIDENT ('[Guests]', RESEED, 0);
DBCC CHECKIDENT ('[Rooms]', RESEED, 0);
DBCC CHECKIDENT ('[RoomTypes]', RESEED, 0);
GO

PRINT 'Base de datos limpiada exitosamente.';
PRINT 'Se conservaron: Usuarios, Roles y Configuración del sistema.';
GO
