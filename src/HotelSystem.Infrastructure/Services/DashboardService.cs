using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Application.Interfaces;
using HotelSystem.Domain.Enums;
using HotelSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelSystem.Infrastructure.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly HotelDbContext _context;
        private readonly IMapper _mapper;

        public DashboardService(HotelDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<DashboardStatsDto> GetStats()
        {
             var today = DateTime.UtcNow.Date;

            // Room Stats
            var pendingRooms = await _context.Rooms.ToListAsync();
            var totalRooms = pendingRooms.Count;
            var occupiedRooms = pendingRooms.Count(r => r.Status == RoomStatus.Occupied);
            var availableRooms = pendingRooms.Count(r => r.Status == RoomStatus.Available);
            var cleaningRooms = pendingRooms.Count(r => r.Status == RoomStatus.Cleaning);
            var maintenanceRooms = pendingRooms.Count(r => r.Status == RoomStatus.Maintenance);

            // Reservation Stats
            var reservations = await _context.Reservations
                .Include(r => r.Guest) // Include Guest for Recent Bookings display
                .Include(r => r.Room)  // Include Room for Recent Bookings display
                .ToListAsync();

            var totalBookings = reservations.Count;
            
            var checkInsToday = reservations.Count(r => r.CheckInDate.Date == today && r.Status == ReservationStatus.Confirmed); // Confirmed ready to check in
            var checkOutsToday = reservations.Count(r => r.CheckOutDate.Date == today && r.Status == ReservationStatus.CheckedIn); // CheckedIn ready to check out

            var totalRevenue = reservations
                .Where(r => r.Status != ReservationStatus.Cancelled)
                .Sum(r => r.TotalPrice);

            // Recent Bookings (Last 5)
            // Note: Sorting by CheckInDate descending for now
            var recentBookingsDto = _mapper.Map<List<ReservationDto>>(
                reservations.OrderByDescending(r => r.CheckInDate).Take(5)
            );


            return new DashboardStatsDto
            {
                TotalRooms = totalRooms,
                OccupiedRooms = occupiedRooms,
                AvailableRooms = availableRooms,
                CleaningRooms = cleaningRooms,
                MaintenanceRooms = maintenanceRooms,
                TotalBookings = totalBookings,
                CheckInsToday = checkInsToday,
                CheckOutsToday = checkOutsToday,
                TotalRevenue = totalRevenue,
                RecentBookings = recentBookingsDto
            };
        }

        public async Task<DashboardStatsComparisonDto> GetStatsComparison(DateTime? startDate = null, DateTime? endDate = null, int previousPeriodDays = 30)
        {
            var end = endDate ?? DateTime.UtcNow.Date;
            var start = startDate ?? end.AddDays(-previousPeriodDays);
            var daysDiff = (end - start).Days;
            
            var previousEnd = start.AddDays(-1);
            var previousStart = previousEnd.AddDays(-daysDiff);

            var currentStats = await GetStatsForPeriod(start, end);
            var previousStats = await GetStatsForPeriod(previousStart, previousEnd);

            var changes = new StatChanges
            {
                TotalRevenueChange = CalculatePercentageChange(previousStats.TotalRevenue, currentStats.TotalRevenue),
                BookingsCountChange = CalculatePercentageChange(previousStats.TotalBookings, currentStats.TotalBookings),
                OccupancyRateChange = CalculatePercentageChange(
                    previousStats.TotalRooms > 0 ? (decimal)previousStats.OccupiedRooms / previousStats.TotalRooms * 100 : 0,
                    currentStats.TotalRooms > 0 ? (decimal)currentStats.OccupiedRooms / currentStats.TotalRooms * 100 : 0
                )
            };

            return new DashboardStatsComparisonDto
            {
                Current = currentStats,
                Previous = previousStats,
                Changes = changes
            };
        }

        public async Task<List<RevenueChartDataDto>> GetRevenueChart(DateTime startDate, DateTime endDate)
        {
            var reservations = await _context.Reservations
                .Where(r => r.CheckInDate >= startDate && r.CheckInDate <= endDate && r.Status != ReservationStatus.Cancelled)
                .ToListAsync();

            var chartData = reservations
                .GroupBy(r => r.CheckInDate.Date)
                .Select(g => new RevenueChartDataDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Amount = g.Sum(r => r.TotalPrice)
                })
                .OrderBy(d => d.Date)
                .ToList();

            return chartData;
        }

        private async Task<DashboardStatsDto> GetStatsForPeriod(DateTime startDate, DateTime endDate)
        {
            var rooms = await _context.Rooms.ToListAsync();
            var totalRooms = rooms.Count;
            var occupiedRooms = rooms.Count(r => r.Status == RoomStatus.Occupied);
            var availableRooms = rooms.Count(r => r.Status == RoomStatus.Available);
            var cleaningRooms = rooms.Count(r => r.Status == RoomStatus.Cleaning);
            var maintenanceRooms = rooms.Count(r => r.Status == RoomStatus.Maintenance);

            var reservations = await _context.Reservations
                .Include(r => r.Guest)
                .Include(r => r.Room)
                .Where(r => r.CheckInDate >= startDate && r.CheckInDate <= endDate)
                .ToListAsync();

            var totalBookings = reservations.Count;
            var checkInsToday = reservations.Count(r => r.CheckInDate.Date == endDate && r.Status == ReservationStatus.Confirmed);
            var checkOutsToday = reservations.Count(r => r.CheckOutDate.Date == endDate && r.Status == ReservationStatus.CheckedIn);

            var totalRevenue = reservations
                .Where(r => r.Status != ReservationStatus.Cancelled)
                .Sum(r => r.TotalPrice);

            var recentBookingsDto = _mapper.Map<List<ReservationDto>>(
                reservations.OrderByDescending(r => r.CheckInDate).Take(5)
            );

            return new DashboardStatsDto
            {
                TotalRooms = totalRooms,
                OccupiedRooms = occupiedRooms,
                AvailableRooms = availableRooms,
                CleaningRooms = cleaningRooms,
                MaintenanceRooms = maintenanceRooms,
                TotalBookings = totalBookings,
                CheckInsToday = checkInsToday,
                CheckOutsToday = checkOutsToday,
                TotalRevenue = totalRevenue,
                RecentBookings = recentBookingsDto
            };
        }

        private decimal CalculatePercentageChange(decimal oldValue, decimal newValue)
        {
            if (oldValue == 0) return newValue > 0 ? 100 : 0;
            return Math.Round(((newValue - oldValue) / oldValue) * 100, 1);
        }
    }
}
