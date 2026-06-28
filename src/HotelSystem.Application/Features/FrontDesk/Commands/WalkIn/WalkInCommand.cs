using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.FrontDesk.Commands.WalkIn
{
    public class WalkInCommand : IRequest<ReservationDto>
    {
        public Guid? GuestId { get; set; }
        // If no GuestId, create guest on the fly
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string IdentificationNumber { get; set; } = string.Empty;

        public Guid RoomId { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int Adults { get; set; } = 1;
        public int Children { get; set; } = 0;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public string Notes { get; set; } = string.Empty;
    }

    public class WalkInCommandHandler : IRequestHandler<WalkInCommand, ReservationDto>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Guest> _guestRepository;
        private readonly IGenericRepository<Room> _roomRepository;

        public WalkInCommandHandler(
            IGenericRepository<Reservation> reservationRepository,
            IGenericRepository<Guest> guestRepository,
            IGenericRepository<Room> roomRepository)
        {
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
        }

        public async Task<ReservationDto> Handle(WalkInCommand request, CancellationToken cancellationToken)
        {
            // 1. Resolve or create guest
            Guest? guest = null;
            if (request.GuestId.HasValue)
            {
                guest = await _guestRepository.GetByIdAsync(request.GuestId.Value);
                if (guest == null) throw new Exception("Guest not found");
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
                    throw new Exception("Guest first and last name are required for walk-in");

                guest = new Guest
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Phone = request.Phone,
                    IdentificationNumber = request.IdentificationNumber,
                    IsActive = true
                };
                await _guestRepository.AddAsync(guest);
            }

            // 2. Get room and calculate price
            var room = await _roomRepository.GetByIdAsync(request.RoomId, "RoomType");
            if (room == null) throw new Exception("Room not found");
            if (room.Status != RoomStatus.Available) throw new Exception("Room is not available");

            var nights = Math.Max(1, (request.CheckOutDate.Date - DateTime.UtcNow.Date).Days);
            var pricePerNight = room.RoomType?.BasePrice ?? 0;
            var totalPrice = nights * pricePerNight;

            // 3. Create reservation as CheckedIn directly
            var reservation = new Reservation
            {
                GuestId = guest.Id,
                RoomId = request.RoomId,
                CheckInDate = DateTime.UtcNow,
                CheckOutDate = request.CheckOutDate,
                Adults = request.Adults,
                Children = request.Children,
                TotalPrice = totalPrice,
                Status = ReservationStatus.CheckedIn,
                Notes = $"[WALK-IN] {request.Notes}"
            };
            await _reservationRepository.AddAsync(reservation);

            // 4. Update room status
            room.Status = RoomStatus.Occupied;
            await _roomRepository.UpdateAsync(room);

            return new ReservationDto
            {
                Id = reservation.Id,
                GuestId = guest.Id,
                GuestName = $"{guest.FirstName} {guest.LastName}",
                RoomId = room.Id,
                RoomNumber = room.Number,
                CheckInDate = reservation.CheckInDate,
                CheckOutDate = reservation.CheckOutDate,
                Adults = reservation.Adults,
                Children = reservation.Children,
                TotalPrice = reservation.TotalPrice,
                Status = reservation.Status,
                Notes = reservation.Notes
            };
        }
    }
}
