namespace HotelSystem.Application.DTOs
{
    public class RevenueReportDto
    {
        public decimal TotalRevenue { get; set; }
        public List<RevenueByDateDto> RevenueByDate { get; set; } = new();
        public List<RevenueByRoomTypeDto> RevenueByRoomType { get; set; } = new();
    }

    public class RevenueByDateDto
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    public class RevenueByRoomTypeDto
    {
        public string RoomTypeName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int ReservationCount { get; set; }
    }

    public class OccupancyReportDto
    {
        public double CurrentOccupancyRate { get; set; }
        public int TotalRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public List<OccupancyByDateDto> OccupancyByDate { get; set; } = new();
    }

    public class OccupancyByDateDto
    {
        public DateTime Date { get; set; }
        public double OccupancyRate { get; set; }
    }

    public class GuestStatsDto
    {
        public int TotalGuests { get; set; }
        public int NewGuestsThisMonth { get; set; }
        public int ReturningGuests { get; set; }
        public List<GuestsByCountryDto> GuestsByCountry { get; set; } = new();
    }

    public class GuestsByCountryDto
    {
        public string Country { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
