using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Housekeeping.Queries.GetAllTasks
{
    public class GetAllTasksQuery : IRequest<List<HousekeepingTaskDto>>
    {
        public string? StatusFilter { get; set; }   // "Pending" | "InProgress" | "Completed" | "Skipped"
        public Guid? RoomId { get; set; }
        public string? AssignedToUserId { get; set; }
        public DateTime? Date { get; set; }
    }

    public class GetAllTasksQueryHandler : IRequestHandler<GetAllTasksQuery, List<HousekeepingTaskDto>>
    {
        private readonly IGenericRepository<HousekeepingTask> _taskRepository;
        private readonly IGenericRepository<Room> _roomRepository;

        public GetAllTasksQueryHandler(
            IGenericRepository<HousekeepingTask> taskRepository,
            IGenericRepository<Room> roomRepository)
        {
            _taskRepository = taskRepository;
            _roomRepository = roomRepository;
        }

        public async Task<List<HousekeepingTaskDto>> Handle(GetAllTasksQuery request, CancellationToken cancellationToken)
        {
            HousekeepingTaskStatus? statusFilter = null;
            if (!string.IsNullOrWhiteSpace(request.StatusFilter) &&
                Enum.TryParse<HousekeepingTaskStatus>(request.StatusFilter, true, out var parsed))
                statusFilter = parsed;

            var tasks = await _taskRepository.GetAsync(
                t => (!statusFilter.HasValue || t.Status == statusFilter.Value)
                  && (!request.RoomId.HasValue || t.RoomId == request.RoomId.Value)
                  && (request.AssignedToUserId == null || t.AssignedToUserId == request.AssignedToUserId)
                  && (!request.Date.HasValue || t.ScheduledFor.Date == request.Date.Value.Date),
                "Room,Room.RoomType");

            return tasks.Select(t => new HousekeepingTaskDto
            {
                Id = t.Id,
                RoomId = t.RoomId,
                RoomNumber = t.Room?.Number ?? string.Empty,
                Floor = t.Room?.Floor ?? 0,
                AssignedToUserId = t.AssignedToUserId,
                AssignedToUserName = t.AssignedToUserName,
                TaskType = t.TaskType,
                Priority = t.Priority,
                Status = t.Status,
                ScheduledFor = t.ScheduledFor,
                CompletedAt = t.CompletedAt,
                Notes = t.Notes,
                CreatedAt = t.CreatedAt
            }).OrderByDescending(t => t.Priority).ThenBy(t => t.ScheduledFor).ToList();
        }
    }
}
