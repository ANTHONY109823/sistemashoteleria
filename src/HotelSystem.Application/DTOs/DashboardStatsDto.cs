namespace HotelSystem.Application.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public int AvailableRooms { get; set; }
        public int CleaningRooms { get; set; }
        public int MaintenanceRooms { get; set; }
        public int TotalBookings { get; set; }
        public int CheckInsToday { get; set; }
        public int CheckOutsToday { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<ReservationDto> RecentBookings { get; set; } = new();
    }
}
