namespace HotelSystem.Application.DTOs
{
    public class RoomTypeDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public int Capacity { get; set; }
        public string Color { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
