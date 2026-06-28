import { z } from 'zod';

// Guest Validation Schema
export const guestSchema = z.object({
    firstName: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

    lastName: z.string()
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(50, 'El apellido no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),

    email: z.string()
        .email('Ingrese un correo electrónico válido')
        .toLowerCase(),

    phone: z.string()
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(15, 'El teléfono no puede exceder 15 dígitos')
        .regex(/^[0-9+\s()-]+$/, 'El teléfono solo puede contener números y caracteres válidos'),

    identificationNumber: z.string()
        .min(5, 'El documento debe tener al menos 5 caracteres')
        .max(20, 'El documento no puede exceder 20 caracteres')
        .regex(/^[a-zA-Z0-9-]+$/, 'El documento solo puede contener letras, números y guiones'),
});

// Room Validation Schema
export const roomSchema = z.object({
    number: z.string()
        .min(1, 'El número de habitación es requerido')
        .max(10, 'El número no puede exceder 10 caracteres')
        .regex(/^[a-zA-Z0-9-]+$/, 'Solo puede contener letras, números y guiones'),

    roomTypeId: z.string()
        .min(1, 'Debe seleccionar un tipo de habitación'),

    floor: z.number()
        .int('El piso debe ser un número entero')
        .min(0, 'El piso no puede ser negativo')
        .max(50, 'El piso no puede exceder 50'),
});


// Reservation Validation Schema
export const reservationSchema = z.object({
    guestId: z.string()
        .min(1, 'Debe seleccionar un huésped'),

    roomId: z.string()
        .min(1, 'Debe seleccionar una habitación'),

    checkInDate: z.string()
        .min(1, 'La fecha de entrada es requerida'),

    checkOutDate: z.string()
        .min(1, 'La fecha de salida es requerida'),

    adults: z.number()
        .int('El número de adultos debe ser entero')
        .min(1, 'Debe haber al menos 1 adulto')
        .max(10, 'Máximo 10 adultos por habitación'),

    children: z.number()
        .int('El número de niños debe ser entero')
        .min(0, 'El número de niños no puede ser negativo')
        .max(10, 'Máximo 10 niños por habitación'),

    notes: z.string().optional(),
}).refine(data => {
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    return checkOut > checkIn;
}, {
    message: 'La fecha de salida debe ser posterior a la fecha de entrada',
    path: ['checkOutDate'],
});

// Type exports for TypeScript
export type GuestFormData = z.infer<typeof guestSchema>;
export type RoomFormData = z.infer<typeof roomSchema>;
export type ReservationFormData = z.infer<typeof reservationSchema>;
