using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Housekeeping.Commands.CreateTask
{
    public class CreateTaskCommand : IRequest<HousekeepingTaskDto>
    {
        public Guid RoomId { get; set; }
        public HousekeepingTaskType TaskType { get; set; } = HousekeepingTaskType.Cleaning;
        public TaskPriority Priority { get; set; } = TaskPriority.Normal;
        public DateTime ScheduledFor { get; set; } = DateTime.UtcNow;
        public string Notes { get; set; } = string.Empty;
        public string? AssignedToUserId { get; set; }
        public string AssignedToUserName { get; set; } = string.Empty;
    }

    public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, HousekeepingTaskDto>
    {
        private readonly IGenericRepository<HousekeepingTask> _taskRepository;
        private readonly IGenericRepository<Room> _roomRepository;

        public CreateTaskCommandHandler(
            IGenericRepository<HousekeepingTask> taskRepository,
            IGenericRepository<Room> roomRepository)
        {
            _taskRepository = taskRepository;
            _roomRepository = roomRepository;
        }

        public async Task<HousekeepingTaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
        {
            var room = await _roomRepository.GetByIdAsync(request.RoomId);
            if (room == null) throw new Exception("Room not found");

            var task = new HousekeepingTask
            {
                RoomId = request.RoomId,
                TaskType = request.TaskType,
                Priority = request.Priority,
                Status = HousekeepingTaskStatus.Pending,
                ScheduledFor = request.ScheduledFor,
                Notes = request.Notes,
                AssignedToUserId = request.AssignedToUserId,
                AssignedToUserName = request.AssignedToUserName
            };

            await _taskRepository.AddAsync(task);

            return new HousekeepingTaskDto
            {
                Id = task.Id,
                RoomId = task.RoomId,
                RoomNumber = room.Number,
                Floor = room.Floor,
                AssignedToUserId = task.AssignedToUserId,
                AssignedToUserName = task.AssignedToUserName,
                TaskType = task.TaskType,
                Priority = task.Priority,
                Status = task.Status,
                ScheduledFor = task.ScheduledFor,
                Notes = task.Notes,
                CreatedAt = task.CreatedAt
            };
        }
    }
}
