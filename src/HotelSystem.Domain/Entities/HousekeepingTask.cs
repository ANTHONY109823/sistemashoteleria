using HotelSystem.Domain.Common;
using HotelSystem.Domain.Enums;

namespace HotelSystem.Domain.Entities
{
    public class HousekeepingTask : Entity
    {
        public Guid RoomId { get; set; }
        public Room? Room { get; set; }

        public string? AssignedToUserId { get; set; }
        public string AssignedToUserName { get; set; } = string.Empty;

        public HousekeepingTaskType TaskType { get; set; } = HousekeepingTaskType.Cleaning;
        public TaskPriority Priority { get; set; } = TaskPriority.Normal;
        public HousekeepingTaskStatus Status { get; set; } = HousekeepingTaskStatus.Pending;

        public DateTime ScheduledFor { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
