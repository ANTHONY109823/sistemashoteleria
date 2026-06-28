using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Reservations.Commands.CancelReservation
{
    public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand, ReservationDto>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IMapper _mapper;

        public CancelReservationCommandHandler(
            IGenericRepository<Reservation> reservationRepository,
            IMapper mapper)
        {
            _reservationRepository = reservationRepository;
            _mapper = mapper;
        }

        public async Task<ReservationDto> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
        {
            // Get reservation with related data
            var reservation = await _reservationRepository.GetByIdAsync(Guid.Parse(request.Id), "Guest,Room");
            
            if (reservation == null)
            {
                throw new Exception("Reservation not found");
            }

            // Update status to Cancelled
            reservation.Status = ReservationStatus.Cancelled;
            await _reservationRepository.UpdateAsync(reservation);

            // Return DTO
            var dto = _mapper.Map<ReservationDto>(reservation);
            return dto;
        }
    }
}
