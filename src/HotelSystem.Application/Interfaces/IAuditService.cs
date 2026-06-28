using HotelSystem.Domain.Entities;

namespace HotelSystem.Application.Interfaces
{
    public interface IAuditService
    {
        Task LogAction(string userId, string userName, string action, string entityType, string entityId, string? oldValues = null, string? newValues = null, string ipAddress = "");
        Task<List<AuditLog>> GetAllLogs(int limit = 100);
        Task<List<AuditLog>> GetLogsByUser(string userId, int limit = 50);
    }
}
