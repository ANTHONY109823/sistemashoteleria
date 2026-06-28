namespace HotelSystem.Application.DTOs
{
    public class GuestDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string IdentificationNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
