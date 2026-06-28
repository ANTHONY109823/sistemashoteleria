using MediatR;

namespace HotelSystem.Application.Features.Rooms.Commands.ToggleRoomActive
{
    public class ToggleRoomActiveCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }
}
