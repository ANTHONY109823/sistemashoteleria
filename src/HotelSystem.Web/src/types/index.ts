export interface RoomType {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    capacity: number;
    color: string;
    isActive: boolean;
}

export interface CreateRoomTypeRequest {
    name: string;
    description: string;
    basePrice: number;
    capacity: number;
    color: string;
    isActive?: boolean;
}


export interface UpdateGuestRequest {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    identificationNumber: string;
}

export interface CreateGuestRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    identificationNumber: string;
}

export interface DashboardStats {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    cleaningRooms: number;
    maintenanceRooms: number;
    totalBookings: number;
    checkInsToday: number;
    checkOutsToday: number;
    totalRevenue: number;
    recentBookings: Reservation[];
}

export interface DashboardStatsComparison {
    current: DashboardStats;
    previous: DashboardStats;
    changes: StatChanges;
}

export interface StatChanges {
    totalRevenueChange: number;
    bookingsCountChange: number;
    occupancyRateChange: number;
}

export interface RevenueChartData {
    date: string;
    amount: number;
}

export interface Room {
    id: string;
    number: string;
    roomTypeId: string;
    roomType?: RoomType; // Optional if not always eager loaded
    roomTypeName?: string; // Mapped from backend
    status: RoomStatus;
    floor: number;
    pricePerNight: number;
    isActive: boolean;
}

export enum RoomStatus {
    Available = 0,
    Occupied = 1,
    Cleaning = 2,
    Maintenance = 3
}

export interface CreateRoomRequest {
    number: string;
    roomTypeId: string;
    floor: number;
}

export interface UpdateRoomRequest {
    id: string;
    number: string;
    roomTypeId: string;
    floor: number;
}

export interface Reservation {
    id: string;
    roomId: string;
    roomNumber: string;
    guestId: string;
    guestName: string;
    checkInDate: string; // ISO Date
    checkOutDate: string; // ISO Date
    adults: number;
    children: number;
    totalPrice: number;
    status: ReservationStatus;
    notes: string;
}

export enum ReservationStatus {
    Pending = 0,
    Confirmed = 1,
    CheckedIn = 2,
    CheckedOut = 3,
    Cancelled = 4,
    NoShow = 5
}

export interface CreateReservationRequest {
    roomId: string;
    guestId: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    notes?: string;
}

export interface Guest {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    identificationNumber: string;
    isActive: boolean;
}
