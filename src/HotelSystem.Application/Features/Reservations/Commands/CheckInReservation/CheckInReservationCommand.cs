using MediatR;
using System;

namespace HotelSystem.Application.Features.Reservations.Commands.CheckInReservation
{
    public class CheckInReservationCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}
