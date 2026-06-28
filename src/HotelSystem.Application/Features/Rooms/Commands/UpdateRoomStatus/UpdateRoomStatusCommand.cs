using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces; // Added this
using MediatR;

namespace HotelSystem.Application.Features.Rooms.Commands.UpdateRoomStatus
{
    public class UpdateRoomStatusCommand : IRequest
    {
        public Guid RoomId { get; set; }
        public RoomStatus NewStatus { get; set; }
    }

    public class UpdateRoomStatusCommandHandler : IRequestHandler<UpdateRoomStatusCommand>
    {
        private readonly IGenericRepository<Room> _repository;

        public UpdateRoomStatusCommandHandler(IGenericRepository<Room> repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateRoomStatusCommand request, CancellationToken cancellationToken)
        {
            var room = await _repository.GetByIdAsync(request.RoomId);
            if (room == null)
            {
                throw new Exception("Room not found");
            }

            room.Status = request.NewStatus;
            await _repository.UpdateAsync(room);
        }
    }
}
