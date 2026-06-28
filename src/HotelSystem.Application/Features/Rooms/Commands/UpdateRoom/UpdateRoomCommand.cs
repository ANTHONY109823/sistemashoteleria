using MediatR;

namespace HotelSystem.Application.Features.Rooms.Commands.UpdateRoom
{
    public class UpdateRoomCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public Guid RoomTypeId { get; set; }
        public int Floor { get; set; }
    }
}
