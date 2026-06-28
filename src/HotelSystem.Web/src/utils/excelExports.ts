import * as XLSX from 'xlsx';
import { Reservation, RevenueChartData } from '../types';
import { format } from 'date-fns';

export const exportReservationsToExcel = (reservations: Reservation[], filename: string = 'reservations.xlsx') => {
    // 1. Format data for Excel
    const data = reservations.map(r => ({
        'ID': r.id,
        'Room': r.roomNumber,
        'Guest Name': r.guestName,
        'Check-In': format(new Date(r.checkInDate), 'yyyy-MM-dd'),
        'Check-Out': format(new Date(r.checkOutDate), 'yyyy-MM-dd'),
        'Adults': r.adults,
        'Children': r.children,
        'Total Price': r.totalPrice,
        'Status': getStatusText(r.status),
        'Notes': r.notes || ''
    }));

    // 2. Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Customize columns (optional - set widths)
    const wscols = [
        { wch: 30 }, // ID
        { wch: 10 }, // Room
        { wch: 25 }, // Guest
        { wch: 15 }, // Check-In
        { wch: 15 }, // Check-Out
        { wch: 8 },  // Adults
        { wch: 8 },  // Children
        { wch: 15 }, // Total
        { wch: 15 }, // Status
        { wch: 30 }  // Notes
    ];
    worksheet['!cols'] = wscols;

    // 4. Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservations');

    // 5. Save file
    XLSX.writeFile(workbook, filename);
};

export const exportGuestsToExcel = (guests: any[], filename: string = 'guests.xlsx') => {
    const data = guests.map(g => ({
        'First Name': g.firstName,
        'Last Name': g.lastName,
        'Email': g.email,
        'Phone': g.phone,
        'ID Number': g.identificationNumber
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
    XLSX.writeFile(workbook, filename);
};

export const exportRevenueToExcel = (revenueData: RevenueChartData[], dateRange: { start: string, end: string }, filename: string = 'revenue_data.xlsx') => {
    const data = revenueData.map(d => ({
        'Date': d.date,
        'Revenue': d.amount
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Data');

    XLSX.writeFile(workbook, filename);
};

export const exportRoomsToExcel = (rooms: any[], filename: string = 'rooms.xlsx') => {
    const data = rooms.map(r => ({
        'Room Number': r.number,
        'Type': r.roomTypeName || 'Standard',
        'Price': r.pricePerNight,
        'Status': getRoomStatusText(r.status),
        'Floor': r.floor
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rooms');
    XLSX.writeFile(workbook, filename);
};

export const exportRoomTypesToExcel = (roomTypes: any[], filename: string = 'room_types.xlsx') => {
    const data = roomTypes.map(t => ({
        'Name': t.name,
        'Description': t.description,
        'Base Price': t.basePrice,
        'Max Capacity': t.capacity
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Room Types');
    XLSX.writeFile(workbook, filename);
};



const getStatusText = (status: number) => {
    const statuses = ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'No Show'];
    return statuses[status] || 'Unknown';
};

const getRoomStatusText = (status: number) => {
    const statuses = ['Available', 'Occupied', 'Cleaning', 'Maintenance'];
    return statuses[status] || 'Unknown';
};
