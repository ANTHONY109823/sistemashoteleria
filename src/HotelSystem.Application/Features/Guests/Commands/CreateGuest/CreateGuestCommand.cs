using AutoMapper;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Guests.Commands.CreateGuest
{
    public class CreateGuestCommand : IRequest<GuestDto>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string IdentificationNumber { get; set; } = string.Empty;
    }

    public class CreateGuestCommandHandler : IRequestHandler<CreateGuestCommand, GuestDto>
    {
        private readonly IGenericRepository<Guest> _repository;
        private readonly IMapper _mapper;

        public CreateGuestCommandHandler(IGenericRepository<Guest> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<GuestDto> Handle(CreateGuestCommand request, CancellationToken cancellationToken)
        {
            var guest = _mapper.Map<Guest>(request);
            await _repository.AddAsync(guest);
            return _mapper.Map<GuestDto>(guest);
        }
    }
}
