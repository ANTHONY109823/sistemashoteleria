using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Enums;
using MediatR;

namespace HotelSystem.Application.Features.Reservations.Commands.CancelReservation
{
    public class CancelReservationCommand : IRequest<ReservationDto>
    {
        public string Id { get; set; } = string.Empty;
    }
}
