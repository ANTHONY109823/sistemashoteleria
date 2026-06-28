using HotelSystem.Domain.Common;

namespace HotelSystem.Domain.Entities
{
    public class Notification : Entity
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "Info"; // Info, Success, Warning, Error
        public bool IsRead { get; set; }
    }
}
