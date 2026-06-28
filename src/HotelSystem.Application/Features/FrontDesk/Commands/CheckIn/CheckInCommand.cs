using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.FrontDesk.Commands.CheckIn
{
    public class CheckInCommand : IRequest<bool>
    {
        public Guid ReservationId { get; set; }
    }

    public class CheckInCommandHandler : IRequestHandler<CheckInCommand, bool>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Room> _roomRepository;

        public CheckInCommandHandler(IGenericRepository<Reservation> reservationRepository, IGenericRepository<Room> roomRepository)
        {
            _reservationRepository = reservationRepository;
            _roomRepository = roomRepository;
        }

        public async Task<bool> Handle(CheckInCommand request, CancellationToken cancellationToken)
        {
            var reservation = await _reservationRepository.GetByIdAsync(request.ReservationId);
            if (reservation == null) throw new Exception("Reservation not found");

            if (reservation.Status != ReservationStatus.Confirmed)
                throw new Exception($"Cannot check in. Reservation status is {reservation.Status}");

            // Update Reservation
            reservation.Status = ReservationStatus.CheckedIn;
            reservation.CheckInDate = DateTime.UtcNow; // Set actual check-in time
            await _reservationRepository.UpdateAsync(reservation);

            // Update Room
            var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
            if (room != null)
            {
                room.Status = RoomStatus.Occupied;
                await _roomRepository.UpdateAsync(room);
            }

            return true;
        }
    }
}
