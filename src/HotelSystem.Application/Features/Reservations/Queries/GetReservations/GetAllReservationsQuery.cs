using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;
using MediatR;

namespace HotelSystem.Application.Features.Reservations.Queries.GetReservations
{
    public class GetAllReservationsQuery : IRequest<List<ReservationDto>>
    {
    }

    public class GetAllReservationsQueryHandler : IRequestHandler<GetAllReservationsQuery, List<ReservationDto>>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Guest> _guestRepository;
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IMapper _mapper;

        public GetAllReservationsQueryHandler(
            IGenericRepository<Reservation> reservationRepository,
            IGenericRepository<Guest> guestRepository,
            IGenericRepository<Room> roomRepository,
            IMapper mapper)
        {
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
            _mapper = mapper;
        }

        public async Task<List<ReservationDto>> Handle(GetAllReservationsQuery request, CancellationToken cancellationToken)
        {
            // Note: Since GenericRepository GetByIdAsync(id, include) is for single entity, 
            // we might need to extend it for List or just map basic info.
            // For better performance, we should probably add GetAsync with include support to IGenericRepository later.
            // For now, let's fetch all. If we need guest names, we need includes.
            
            var reservations = await _reservationRepository.GetAllAsync();
            var guests = await _guestRepository.GetAllAsync();
            var rooms = await _roomRepository.GetAllAsync();

            // Manual Join because Include string seems unreliable in current GenericRepo usage
            foreach (var reservation in reservations)
            {
                reservation.Guest = guests.FirstOrDefault(g => g.Id == reservation.GuestId);
                reservation.Room = rooms.FirstOrDefault(r => r.Id == reservation.RoomId);
            }
            
            return _mapper.Map<List<ReservationDto>>(reservations);
        }
    }
}
