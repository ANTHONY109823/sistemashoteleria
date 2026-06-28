using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HotelSystem.Infrastructure.Jobs
{
    public class NightAuditJob
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NightAuditJob> _logger;

        public NightAuditJob(IServiceScopeFactory scopeFactory, ILogger<NightAuditJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public async Task RunAsync()
        {
            _logger.LogInformation("Night Audit starting at {Time}", DateTime.UtcNow);

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<HotelDbContext>();

            var today = DateTime.UtcNow.Date;

            // 1. Mark No-Shows: Confirmed reservations whose check-in was today and time has passed
            var noShows = await db.Reservations
                .Include(r => r.Room)
                .Include(r => r.Guest)
                .Where(r => r.Status == ReservationStatus.Confirmed
                         && r.CheckInDate.Date == today)
                .ToListAsync();

            int noShowCount = 0;
            foreach (var res in noShows)
            {
                res.Status = ReservationStatus.NoShow;
                if (res.Room != null && res.Room.Status != RoomStatus.Occupied)
                    res.Room.Status = RoomStatus.Available;

                noShowCount++;
                _logger.LogInformation("Marked reservation {Id} as NoShow", res.Id);
            }

            // 2. Generate daily accommodation charges for checked-in guests
            var checkedIn = await db.Reservations
                .Include(r => r.Room).ThenInclude(r => r!.RoomType)
                .Include(r => r.Guest)
                .Where(r => r.Status == ReservationStatus.CheckedIn)
                .ToListAsync();

            decimal totalDailyRevenue = 0;
            foreach (var res in checkedIn)
            {
                var pricePerNight = res.Room?.RoomType?.BasePrice ?? 0;
                totalDailyRevenue += pricePerNight;
            }

            // 3. Create daily summary notification
            var summaryNotification = new Notification
            {
                Title = $"Night Audit - {today:dd/MM/yyyy}",
                Message = $"Resumen del día: {checkedIn.Count} huéspedes activos | {noShowCount} no-shows registrados | Ingreso del día estimado: S/{totalDailyRevenue:N2}",
                Type = "Info",
                IsRead = false
            };
            db.Notifications.Add(summaryNotification);

            await db.SaveChangesAsync();
            _logger.LogInformation("Night Audit completed. NoShows: {NoShows}, ActiveGuests: {Active}", noShowCount, checkedIn.Count);
        }
    }
}
