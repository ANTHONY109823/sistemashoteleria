using AutoMapper;
using FluentValidation;
using HotelSystem.Application.DTOs;
using HotelSystem.Application.Interfaces;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Reservations.Commands.CreateReservation
{
    public class CreateReservationCommand : IRequest<ReservationDto>
    {
        public Guid RoomId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int Adults { get; set; }
        public int Children { get; set; }
        public string Notes { get; set; } = string.Empty;
        
        // Guest Info (Simplified for MVP: Create guest if not exists)
        public Guid? GuestId { get; set; }
        public GuestDto Guest { get; set; } = new();
    }

    public class CreateReservationCommandValidator : AbstractValidator<CreateReservationCommand>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;

        public CreateReservationCommandValidator(IGenericRepository<Reservation> reservationRepository)
        {
            _reservationRepository = reservationRepository;

            RuleFor(p => p.RoomId).NotEmpty();
            RuleFor(p => p.CheckInDate).GreaterThanOrEqualTo(DateTime.Today).WithMessage("Check-in date must be today or future.");
            RuleFor(p => p.CheckOutDate).GreaterThan(p => p.CheckInDate).WithMessage("Check-out date must be after check-in date.");
            RuleFor(p => p.Adults).GreaterThan(0);
            
            RuleFor(p => p.Guest.FirstName).NotEmpty().When(p => !p.GuestId.HasValue);
            RuleFor(p => p.Guest.LastName).NotEmpty().When(p => !p.GuestId.HasValue);
            RuleFor(p => p.Guest.Email).NotEmpty().EmailAddress().When(p => !p.GuestId.HasValue);
            
            // Custom validation for room availability
            RuleFor(p => p).MustAsync(async (command, cancellation) =>
            {
                var existingReservations = await _reservationRepository.GetAsync(r => 
                    r.RoomId == command.RoomId &&
                    r.Status != ReservationStatus.Cancelled &&
                    r.CheckInDate < command.CheckOutDate && 
                    command.CheckInDate < r.CheckOutDate);

                return !existingReservations.Any();
            }).WithMessage("The room is not available for the selected dates.");
        }
    }

    public class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Guest> _guestRepository;
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;

        public CreateReservationCommandHandler(
            IGenericRepository<Reservation> reservationRepository,
            IGenericRepository<Guest> guestRepository,
            IGenericRepository<Room> roomRepository,
            IMapper mapper,
            IEmailService emailService)
        {
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
            _mapper = mapper;
            _emailService = emailService;
        }

        public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
        {
            // 1. Handle Guest (Check if exists by ID or email, else create)
            Guest guest = null;

            if (request.GuestId.HasValue)
            {
                guest = await _guestRepository.GetByIdAsync(request.GuestId.Value);
                if (guest == null) throw new Exception("Selected guest not found.");
            }
            else
            {
                var guests = await _guestRepository.GetAsync(g => g.Email == request.Guest.Email);
                guest = guests.FirstOrDefault();

                if (guest == null)
                {
                    guest = _mapper.Map<Guest>(request.Guest);
                    await _guestRepository.AddAsync(guest);
                }
            }

            // 2. Calculate Total Price
            var room = await _roomRepository.GetByIdAsync(request.RoomId, "RoomType");
            if (room == null) throw new Exception("Room not found");
            
            decimal pricePerNight = room.RoomType?.BasePrice ?? 0;
             
            var days = (request.CheckOutDate - request.CheckInDate).Days;
            var totalPrice = days * pricePerNight;

            // 3. Create Reservation
            var reservation = new Reservation
            {
                RoomId = request.RoomId,
                GuestId = guest.Id,
                CheckInDate = request.CheckInDate,
                CheckOutDate = request.CheckOutDate,
                Adults = request.Adults,
                Children = request.Children,
                TotalPrice = totalPrice,
                Status = ReservationStatus.Confirmed,
                Notes = request.Notes
            };

            await _reservationRepository.AddAsync(reservation);

            // 4. Send confirmation email
            try
            {
                await _emailService.SendReservationConfirmationAsync(
                    guest.Email,
                    $"{guest.FirstName} {guest.LastName}",
                    reservation.Id.ToString(),
                    reservation.CheckInDate,
                    reservation.CheckOutDate,
                    room.Number,
                    room.RoomType?.Name ?? "N/A",
                    totalPrice);
            }
            catch (Exception ex)
            {
                // Log but don't fail the reservation if email fails
                // _logger.LogError(ex, "Failed to send confirmation email");
            }

            // 5. Return DTO
            var dto = _mapper.Map<ReservationDto>(reservation);
            dto.GuestName = $"{guest.FirstName} {guest.LastName}";
            dto.RoomNumber = room.Number;
            return dto;
        }
    }
}
