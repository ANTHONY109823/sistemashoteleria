using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Housekeeping.Commands.UpdateTaskStatus
{
    public class UpdateTaskStatusCommand : IRequest<bool>
    {
        public Guid TaskId { get; set; }
        public HousekeepingTaskStatus Status { get; set; }
    }

    public class UpdateTaskStatusCommandHandler : IRequestHandler<UpdateTaskStatusCommand, bool>
    {
        private readonly IGenericRepository<HousekeepingTask> _taskRepository;
        private readonly IGenericRepository<Room> _roomRepository;

        public UpdateTaskStatusCommandHandler(
            IGenericRepository<HousekeepingTask> taskRepository,
            IGenericRepository<Room> roomRepository)
        {
            _taskRepository = taskRepository;
            _roomRepository = roomRepository;
        }

        public async Task<bool> Handle(UpdateTaskStatusCommand request, CancellationToken cancellationToken)
        {
            var task = await _taskRepository.GetByIdAsync(request.TaskId);
            if (task == null) throw new Exception("Task not found");

            task.Status = request.Status;

            if (request.Status == HousekeepingTaskStatus.Completed)
            {
                task.CompletedAt = DateTime.UtcNow;

                // When cleaning is completed, update room status to Available
                if (task.TaskType == HousekeepingTaskType.Cleaning)
                {
                    var room = await _roomRepository.GetByIdAsync(task.RoomId);
                    if (room != null && room.Status == RoomStatus.Cleaning)
                    {
                        room.Status = RoomStatus.Available;
                        await _roomRepository.UpdateAsync(room);
                    }
                }
            }

            await _taskRepository.UpdateAsync(task);
            return true;
        }
    }
}
