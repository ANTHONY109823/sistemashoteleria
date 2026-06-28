using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace HotelSystem.Application.Features.RoomTypes.Commands.UpdateRoomType
{
    public class UpdateRoomTypeCommandHandler : IRequestHandler<UpdateRoomTypeCommand, bool>
    {
        private readonly IGenericRepository<RoomType> _repository;

        public UpdateRoomTypeCommandHandler(IGenericRepository<RoomType> repository)
        {
            _repository = repository;
        }

        public async Task<bool> Handle(UpdateRoomTypeCommand request, CancellationToken cancellationToken)
        {
            var roomType = await _repository.GetByIdAsync(request.Id);
            if (roomType == null) return false;

            roomType.Name = request.Name;
            roomType.Description = request.Description;
            roomType.BasePrice = request.BasePrice;
            roomType.Capacity = request.Capacity;
            roomType.Color = request.Color;
            roomType.LastModifiedAt = System.DateTime.UtcNow;

            await _repository.UpdateAsync(roomType);
            return true;
        }
    }
}
