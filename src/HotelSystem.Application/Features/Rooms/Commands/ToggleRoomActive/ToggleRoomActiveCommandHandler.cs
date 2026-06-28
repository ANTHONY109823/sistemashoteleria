using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Rooms.Commands.ToggleRoomActive
{
    public class ToggleRoomActiveCommandHandler : IRequestHandler<ToggleRoomActiveCommand, Unit>
    {
        private readonly IGenericRepository<Room> _roomRepository;

        public ToggleRoomActiveCommandHandler(IGenericRepository<Room> roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<Unit> Handle(ToggleRoomActiveCommand request, CancellationToken cancellationToken)
        {
            var room = await _roomRepository.GetByIdAsync(request.Id);
            
            if (room == null)
                throw new KeyNotFoundException($"Room with ID {request.Id} not found.");

            // Toggle IsActive
            room.IsActive = !room.IsActive;

            await _roomRepository.UpdateAsync(room);
            return Unit.Value;
        }
    }
}
