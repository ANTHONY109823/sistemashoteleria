using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace HotelSystem.Application.Features.Reservations.Commands.CheckInReservation
{
    public class CheckInReservationCommandHandler : IRequestHandler<CheckInReservationCommand, bool>
    {
        private readonly IGenericRepository<Reservation> _repository;

        public CheckInReservationCommandHandler(IGenericRepository<Reservation> repository)
        {
            _repository = repository;
        }

        public async Task<bool> Handle(CheckInReservationCommand request, CancellationToken cancellationToken)
        {
            var reservation = await _repository.GetByIdAsync(request.Id);

            if (reservation == null)
            {
                throw new Exception("Reservation not found");
            }

            if (reservation.Status != ReservationStatus.Confirmed)
            {
                throw new Exception($"Cannot check-in reservation. Current status: {reservation.Status}. Status must be Confirmed.");
            }

            reservation.Status = ReservationStatus.CheckedIn;
            // Optionally update CheckInDate to actual time if needed, currently we assume the scheduled date is respected or we rely on the status change time.
            // But let's stick to status change as requested.
            
            await _repository.UpdateAsync(reservation);

            return true;
        }
    }
}
