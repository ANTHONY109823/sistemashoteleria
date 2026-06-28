using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class ReportsController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public ReportsController(HotelDbContext context)
        {
            _context = context;
        }

        [HttpGet("revenue")]
        public async Task<ActionResult<RevenueReportDto>> GetRevenueReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
                var end = endDate ?? DateTime.UtcNow;

                var reservations = await _context.Reservations
                    .Include(r => r.Room)
                    .ThenInclude(room => room.RoomType)
                    .Where(r => r.CheckInDate >= start && r.CheckInDate <= end && 
                               (r.Status == ReservationStatus.CheckedOut || 
                                r.Status == ReservationStatus.CheckedIn || 
                                r.Status == ReservationStatus.Confirmed))
                    .ToListAsync();

                var totalRevenue = reservations.Sum(r => r.TotalPrice);

                var revenueByDate = reservations
                    .GroupBy(r => r.CheckInDate.Date)
                    .Select(g => new RevenueByDateDto
                    {
                        Date = g.Key,
                        Amount = g.Sum(r => r.TotalPrice)
                    })
                    .OrderBy(x => x.Date)
                    .ToList();

                var revenueByRoomType = reservations
                    .GroupBy(r => r.Room.RoomType.Name)
                    .Select(g => new RevenueByRoomTypeDto
                    {
                        RoomTypeName = g.Key,
                        Revenue = g.Sum(r => r.TotalPrice),
                        ReservationCount = g.Count()
                    })
                    .OrderByDescending(x => x.Revenue)
                    .ToList();

                return Ok(new RevenueReportDto
                {
                    TotalRevenue = totalRevenue,
                    RevenueByDate = revenueByDate,
                    RevenueByRoomType = revenueByRoomType
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("occupancy")]
        public async Task<ActionResult<OccupancyReportDto>> GetOccupancyReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
                var end = endDate ?? DateTime.UtcNow;

                var totalRooms = await _context.Rooms.CountAsync();
                var occupiedRooms = await _context.Reservations
                    .Where(r => r.Status == ReservationStatus.CheckedIn)
                    .Select(r => r.RoomId)
                    .Distinct()
                    .CountAsync();

                var currentOccupancyRate = totalRooms > 0 ? (double)occupiedRooms / totalRooms * 100 : 0;

                // Calculate daily occupancy for the date range
                var occupancyByDate = new List<OccupancyByDateDto>();
                for (var date = start.Date; date <= end.Date; date = date.AddDays(1))
                {
                    var occupiedOnDate = await _context.Reservations
                        .Where(r => r.CheckInDate.Date <= date && r.CheckOutDate.Date >= date &&
                                   (r.Status == ReservationStatus.CheckedIn || r.Status == ReservationStatus.Confirmed))
                        .Select(r => r.RoomId)
                        .Distinct()
                        .CountAsync();

                    var rate = totalRooms > 0 ? (double)occupiedOnDate / totalRooms * 100 : 0;
                    occupancyByDate.Add(new OccupancyByDateDto
                    {
                        Date = date,
                        OccupancyRate = Math.Round(rate, 2)
                    });
                }

                return Ok(new OccupancyReportDto
                {
                    CurrentOccupancyRate = Math.Round(currentOccupancyRate, 2),
                    TotalRooms = totalRooms,
                    OccupiedRooms = occupiedRooms,
                    OccupancyByDate = occupancyByDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("guest-stats")]
        public async Task<ActionResult<GuestStatsDto>> GetGuestStats()
        {
            try
            {
                var totalGuests = await _context.Guests.CountAsync();
                var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                var newGuestsThisMonth = totalGuests; // Simplified since we don't have CreatedDate

                // Guest demographics placeholder - Country field not available in current Guest model
                var guestsByCountry = new List<GuestsByCountryDto>();

                return Ok(new GuestStatsDto
                {
                    TotalGuests = totalGuests,
                    NewGuestsThisMonth = newGuestsThisMonth,
                    ReturningGuests = 0, // Would require tracking reservation history
                    GuestsByCountry = guestsByCountry
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
