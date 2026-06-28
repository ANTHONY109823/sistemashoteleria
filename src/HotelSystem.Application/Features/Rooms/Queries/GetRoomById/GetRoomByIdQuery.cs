using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Rooms.Queries.GetRoomById
{
    public class GetRoomByIdQuery : IRequest<RoomDto?>
    {
        public Guid Id { get; set; }

        public GetRoomByIdQuery(Guid id)
        {
            Id = id;
        }
    }

    public class GetRoomByIdQueryHandler : IRequestHandler<GetRoomByIdQuery, RoomDto?>
    {
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IMapper _mapper;

        public GetRoomByIdQueryHandler(IGenericRepository<Room> roomRepository, IMapper mapper)
        {
            _roomRepository = roomRepository;
            _mapper = mapper;
        }

        public async Task<RoomDto?> Handle(GetRoomByIdQuery request, CancellationToken cancellationToken)
        {
            var room = await _roomRepository.GetByIdAsync(request.Id, "RoomType");
            return _mapper.Map<RoomDto>(room);
        }
    }
}
