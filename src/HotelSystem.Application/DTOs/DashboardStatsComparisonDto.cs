namespace HotelSystem.Application.DTOs
{
    public class DashboardStatsComparisonDto
    {
        public DashboardStatsDto Current { get; set; } = new();
        public DashboardStatsDto Previous { get; set; } = new();
        public StatChanges Changes { get; set; } = new();
    }

    public class StatChanges
    {
        public decimal TotalRevenueChange { get; set; }
        public decimal BookingsCountChange { get; set; }
        public decimal OccupancyRateChange { get; set; }
    }
}
