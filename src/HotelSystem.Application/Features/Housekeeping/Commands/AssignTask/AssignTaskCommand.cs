using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Housekeeping.Commands.AssignTask
{
    public class AssignTaskCommand : IRequest<bool>
    {
        public Guid TaskId { get; set; }
        public string AssignedToUserId { get; set; } = string.Empty;
        public string AssignedToUserName { get; set; } = string.Empty;
    }

    public class AssignTaskCommandHandler : IRequestHandler<AssignTaskCommand, bool>
    {
        private readonly IGenericRepository<HousekeepingTask> _taskRepository;

        public AssignTaskCommandHandler(IGenericRepository<HousekeepingTask> taskRepository)
        {
            _taskRepository = taskRepository;
        }

        public async Task<bool> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
        {
            var task = await _taskRepository.GetByIdAsync(request.TaskId);
            if (task == null) throw new Exception("Task not found");

            task.AssignedToUserId = request.AssignedToUserId;
            task.AssignedToUserName = request.AssignedToUserName;

            await _taskRepository.UpdateAsync(task);
            return true;
        }
    }
}
