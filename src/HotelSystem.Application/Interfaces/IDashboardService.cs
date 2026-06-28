using HotelSystem.Application.DTOs;

namespace HotelSystem.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetStats();
        Task<DashboardStatsComparisonDto> GetStatsComparison(DateTime? startDate = null, DateTime? endDate = null, int previousPeriodDays = 30);
        Task<List<RevenueChartDataDto>> GetRevenueChart(DateTime startDate, DateTime endDate);
    }
}
