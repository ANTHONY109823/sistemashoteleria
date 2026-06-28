using HotelSystem.Domain.Common;
using HotelSystem.Domain.Enums;

namespace HotelSystem.Domain.Entities
{
    public class Room : Entity
    {
        public string Number { get; set; } = string.Empty;
        public Guid RoomTypeId { get; set; }
        public RoomType? RoomType { get; set; }
        public RoomStatus Status { get; set; } = RoomStatus.Available;
        public int Floor { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
