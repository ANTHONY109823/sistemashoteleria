using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Reservations.Commands.MarkNoShow
{
    public class MarkNoShowCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    public class MarkNoShowCommandHandler : IRequestHandler<MarkNoShowCommand, bool>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IGenericRepository<Notification> _notificationRepository;

        public MarkNoShowCommandHandler(
            IGenericRepository<Reservation> reservationRepository,
            IGenericRepository<Room> roomRepository,
            IGenericRepository<Notification> notificationRepository)
        {
            _reservationRepository = reservationRepository;
            _roomRepository = roomRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<bool> Handle(MarkNoShowCommand request, CancellationToken cancellationToken)
        {
            var reservation = await _reservationRepository.GetByIdAsync(request.Id, "Room,Guest");
            if (reservation == null) throw new Exception("Reservation not found");

            if (reservation.Status != ReservationStatus.Confirmed)
                throw new Exception($"Only Confirmed reservations can be marked as No-Show. Current status: {reservation.Status}");

            // Mark as no-show
            reservation.Status = ReservationStatus.NoShow;
            await _reservationRepository.UpdateAsync(reservation);

            // Free the room
            if (reservation.Room != null)
            {
                reservation.Room.Status = RoomStatus.Available;
                await _roomRepository.UpdateAsync(reservation.Room);
            }

            // Create system notification
            var guestName = reservation.Guest != null
                ? $"{reservation.Guest.FirstName} {reservation.Guest.LastName}"
                : reservation.GuestId.ToString();

            await _notificationRepository.AddAsync(new Notification
            {
                Title = "No-Show registrado",
                Message = $"El huésped {guestName} no se presentó para la reservación del {reservation.CheckInDate:dd/MM/yyyy}. Habitación liberada.",
                Type = "Warning",
                IsRead = false
            });

            return true;
        }
    }
}
