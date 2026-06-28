using MediatR;
using System;

namespace HotelSystem.Application.Features.RoomTypes.Commands.ToggleRoomTypeActive
{
    public class ToggleRoomTypeActiveCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}
