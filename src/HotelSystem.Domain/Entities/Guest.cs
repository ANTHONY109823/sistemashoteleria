using HotelSystem.Domain.Common;

namespace HotelSystem.Domain.Entities
{
    public class Guest : Entity
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string IdentificationNumber { get; set; } = string.Empty; // Passport, ID, etc.
        public string Address { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
