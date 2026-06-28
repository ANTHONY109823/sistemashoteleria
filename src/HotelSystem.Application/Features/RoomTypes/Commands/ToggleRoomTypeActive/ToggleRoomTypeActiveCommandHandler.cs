using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace HotelSystem.Application.Features.RoomTypes.Commands.ToggleRoomTypeActive
{
    public class ToggleRoomTypeActiveCommandHandler : IRequestHandler<ToggleRoomTypeActiveCommand, bool>
    {
        private readonly IGenericRepository<RoomType> _repository;

        public ToggleRoomTypeActiveCommandHandler(IGenericRepository<RoomType> repository)
        {
            _repository = repository;
        }

        public async Task<bool> Handle(ToggleRoomTypeActiveCommand request, CancellationToken cancellationToken)
        {
            var roomType = await _repository.GetByIdAsync(request.Id);
            if (roomType == null) return false;

            roomType.IsActive = !roomType.IsActive;
            roomType.LastModifiedAt = System.DateTime.UtcNow;

            await _repository.UpdateAsync(roomType);
            return true;
        }
    }
}
