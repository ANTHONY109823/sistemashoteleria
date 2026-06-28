using MediatR;
using HotelSystem.Application.DTOs;

namespace HotelSystem.Application.Features.Reservations.Commands.UpdateReservation
{
    public class UpdateReservationCommand : IRequest<ReservationDto>
    {
        public Guid Id { get; set; }
        public Guid GuestId { get; set; }
        public Guid RoomId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int Adults { get; set; }
        public int Children { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
