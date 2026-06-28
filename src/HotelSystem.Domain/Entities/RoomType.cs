using HotelSystem.Domain.Common;

namespace HotelSystem.Domain.Entities
{
    public class RoomType : Entity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public int Capacity { get; set; }
        public string Color { get; set; } = "#2563eb"; // Default blue color
        public bool IsActive { get; set; } = true;
        
        // Navigation properties (optional for now)
        // public ICollection<Room> Rooms { get; set; }
    }
}
