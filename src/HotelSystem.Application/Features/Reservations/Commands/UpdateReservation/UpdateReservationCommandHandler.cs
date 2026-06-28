using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Reservations.Commands.UpdateReservation
{
    public class UpdateReservationCommandHandler : IRequestHandler<UpdateReservationCommand, ReservationDto>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IMapper _mapper;

        public UpdateReservationCommandHandler(
            IGenericRepository<Reservation> reservationRepository,
            IGenericRepository<Room> roomRepository,
            IMapper mapper)
        {
            _reservationRepository = reservationRepository;
            _roomRepository = roomRepository;
            _mapper = mapper;
        }

        public async Task<ReservationDto> Handle(UpdateReservationCommand request, CancellationToken cancellationToken)
        {
            var reservation = await _reservationRepository.GetByIdAsync(request.Id);
            if (reservation == null)
            {
                throw new Exception($"Reservation with ID {request.Id} not found.");
            }

            // If room is changing, validation is needed (simplified here, ideally check availability)
            if (reservation.RoomId != request.RoomId)
            {
                 var room = await _roomRepository.GetByIdAsync(request.RoomId);
                 if (room == null)
                 {
                     throw new Exception($"Room with ID {request.RoomId} not found.");
                 }
                 // In a real scenario, we should check if the new room is available for the dates
            }

            // Update properties
            reservation.GuestId = request.GuestId;
            reservation.RoomId = request.RoomId;
            reservation.CheckInDate = request.CheckInDate;
            reservation.CheckOutDate = request.CheckOutDate;
            reservation.Adults = request.Adults;
            reservation.Children = request.Children;
            reservation.Notes = request.Notes;
            
            // Recalculate Total Price if dates or room changed (Logic depends on domain, here simplified)
            // Assuming strict update of fields for now. 
            // Ideally, we should fetch room price and recalculate.
            // Let's at least try to update the price based on new room/dates? 
            // For now, I'll trust the command creates a valid state or just updates fields as requested.
            // To be safe, let's recalculate price if room or dates changed to ensure data integrity.
            
            var roomForPrice = await _roomRepository.GetByIdAsync(request.RoomId, "RoomType");
            if(roomForPrice != null && roomForPrice.RoomType != null)
            {
                 var nights = (int)(request.CheckOutDate - request.CheckInDate).TotalDays;
                 if(nights < 1) nights = 1;
                 reservation.TotalPrice = roomForPrice.RoomType.BasePrice * nights;
            }

            await _reservationRepository.UpdateAsync(reservation);

            return _mapper.Map<ReservationDto>(reservation);
        }
    }
}
