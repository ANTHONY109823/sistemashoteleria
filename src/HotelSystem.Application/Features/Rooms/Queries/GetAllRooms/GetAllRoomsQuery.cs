using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Rooms.Queries.GetAllRooms
{
    public class GetAllRoomsQuery : IRequest<List<RoomDto>>
    {
    }

    public class GetAllRoomsQueryHandler : IRequestHandler<GetAllRoomsQuery, List<RoomDto>>
    {
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IMapper _mapper;

        public GetAllRoomsQueryHandler(IGenericRepository<Room> roomRepository, IMapper mapper)
        {
            _roomRepository = roomRepository;
            _mapper = mapper;
        }

        public async Task<List<RoomDto>> Handle(GetAllRoomsQuery request, CancellationToken cancellationToken)
        {
            var rooms = await _roomRepository.GetAllAsync("RoomType");
            return _mapper.Map<List<RoomDto>>(rooms);
        }
    }
}
