using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.FrontDesk.Commands.CheckOut
{
    public class CheckOutCommand : IRequest<bool>
    {
        public Guid ReservationId { get; set; }
    }

    public class CheckOutCommandHandler : IRequestHandler<CheckOutCommand, bool>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Room> _roomRepository;

        public CheckOutCommandHandler(IGenericRepository<Reservation> reservationRepository, IGenericRepository<Room> roomRepository)
        {
            _reservationRepository = reservationRepository;
            _roomRepository = roomRepository;
        }

        public async Task<bool> Handle(CheckOutCommand request, CancellationToken cancellationToken)
        {
            var reservation = await _reservationRepository.GetByIdAsync(request.ReservationId);
            if (reservation == null) throw new Exception("Reservation not found");

            if (reservation.Status != ReservationStatus.CheckedIn)
                throw new Exception($"Cannot check out. Reservation status is {reservation.Status}");

            // Update Reservation
            reservation.Status = ReservationStatus.CheckedOut;
            reservation.CheckOutDate = DateTime.UtcNow; // Set actual check-out time
            await _reservationRepository.UpdateAsync(reservation);

            // Update Room
            var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
            if (room != null)
            {
                room.Status = RoomStatus.Cleaning; // Mark for cleaning
                await _roomRepository.UpdateAsync(room);
            }

            return true;
        }
    }
}
