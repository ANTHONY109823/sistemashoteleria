using HotelSystem.Domain.Enums;

namespace HotelSystem.Application.DTOs
{
    public class RoomDto
    {
        public Guid Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public Guid RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public RoomStatus Status { get; set; }
        public int Floor { get; set; }
        public decimal PricePerNight { get; set; }
        public bool IsActive { get; set; }
    }
}
