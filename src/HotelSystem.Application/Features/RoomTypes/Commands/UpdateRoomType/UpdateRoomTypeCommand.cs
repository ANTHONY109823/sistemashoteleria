using MediatR;
using System;

namespace HotelSystem.Application.Features.RoomTypes.Commands.UpdateRoomType
{
    public class UpdateRoomTypeCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal BasePrice { get; set; }
        public int Capacity { get; set; }
        public string Color { get; set; }
    }
}
