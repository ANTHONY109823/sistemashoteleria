using HotelSystem.Domain.Common;
using HotelSystem.Domain.Enums;

namespace HotelSystem.Domain.Entities
{
    public class Reservation : Entity
    {
        public Guid GuestId { get; set; }
        public Guest? Guest { get; set; }
        
        public Guid RoomId { get; set; }
        public Room? Room { get; set; }
        
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        
        public int Adults { get; set; }
        public int Children { get; set; }
        
        public decimal TotalPrice { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        
        public string Notes { get; set; } = string.Empty;
    }
}
