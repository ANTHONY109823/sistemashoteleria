using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.RoomTypes.Queries.GetAllRoomTypes
{
    public class GetAllRoomTypesQuery : IRequest<List<RoomTypeDto>>
    {
    }

    public class GetAllRoomTypesQueryHandler : IRequestHandler<GetAllRoomTypesQuery, List<RoomTypeDto>>
    {
        private readonly IGenericRepository<RoomType> _repository;
        private readonly IMapper _mapper;

        public GetAllRoomTypesQueryHandler(IGenericRepository<RoomType> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<RoomTypeDto>> Handle(GetAllRoomTypesQuery request, CancellationToken cancellationToken)
        {
            var list = await _repository.GetAllAsync();
            return _mapper.Map<List<RoomTypeDto>>(list);
        }
    }
}
