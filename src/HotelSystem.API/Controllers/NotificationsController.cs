using HotelSystem.Domain.Entities;
using HotelSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

using System.Reflection.Metadata;
using HotelSystem.API.Hubs;

namespace HotelSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly HotelDbContext _context;
        // private readonly Microsoft.AspNetCore.SignalR.IHubContext<global::HotelSystem.API.Hubs.NotificationHub> _hubContext;

        public NotificationsController(HotelDbContext context /*, Microsoft.AspNetCore.SignalR.IHubContext<global::HotelSystem.API.Hubs.NotificationHub> hubContext */)
        {
            _context = context;
            // _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int limit = 10)
        {
            var notifications = await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var count = await _context.Notifications.CountAsync(n => !n.IsRead);
            return Ok(new { count });
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            
            // Optional: Notify user that count changed? Usually frontend handles optimistic update.
            return Ok();
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var unread = await _context.Notifications.Where(n => !n.IsRead).ToListAsync();
            foreach (var n in unread)
            {
                n.IsRead = true;
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNotificationRequest request)
        {
            var notification = new Notification
            {
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Send Real-time notification
            // await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification);
            
            return Ok(notification);
        }
    }

    public class CreateNotificationRequest
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
    }
}
