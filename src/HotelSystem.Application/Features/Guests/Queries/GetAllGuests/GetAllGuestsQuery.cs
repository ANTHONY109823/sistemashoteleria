using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Guests.Queries.GetAllGuests
{
    public class GetAllGuestsQuery : IRequest<List<GuestDto>>
    {
    }

    public class GetAllGuestsQueryHandler : IRequestHandler<GetAllGuestsQuery, List<GuestDto>>
    {
        private readonly IGenericRepository<Guest> _repository;
        private readonly IMapper _mapper;

        public GetAllGuestsQueryHandler(IGenericRepository<Guest> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<GuestDto>> Handle(GetAllGuestsQuery request, CancellationToken cancellationToken)
        {
            var guests = await _repository.GetAllAsync();
            return _mapper.Map<List<GuestDto>>(guests);
        }
    }
}
