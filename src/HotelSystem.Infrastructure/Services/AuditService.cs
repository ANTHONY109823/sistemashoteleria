using HotelSystem.Application.Interfaces;
using HotelSystem.Domain.Entities;
using HotelSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelSystem.Infrastructure.Services
{
    public class AuditService : IAuditService
    {
        private readonly HotelDbContext _context;

        public AuditService(HotelDbContext context)
        {
            _context = context;
        }

        public async Task LogAction(string userId, string userName, string action, string entityType, string entityId, string? oldValues = null, string? newValues = null, string ipAddress = "")
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                UserName = userName,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                OldValues = oldValues,
                NewValues = newValues,
                Timestamp = DateTime.UtcNow,
                IpAddress = ipAddress
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLog>> GetAllLogs(int limit = 100)
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<AuditLog>> GetLogsByUser(string userId, int limit = 50)
        {
            return await _context.AuditLogs
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Take(limit)
                .ToListAsync();
        }
    }
}
