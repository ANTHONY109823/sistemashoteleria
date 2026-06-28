using HotelSystem.Domain.Enums;

namespace HotelSystem.Application.DTOs
{
    public class HousekeepingTaskDto
    {
        public Guid Id { get; set; }
        public Guid RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int Floor { get; set; }
        public string? AssignedToUserId { get; set; }
        public string AssignedToUserName { get; set; } = string.Empty;
        public HousekeepingTaskType TaskType { get; set; }
        public TaskPriority Priority { get; set; }
        public HousekeepingTaskStatus Status { get; set; }
        public DateTime ScheduledFor { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
