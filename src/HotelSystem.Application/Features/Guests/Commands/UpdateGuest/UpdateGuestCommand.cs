using AutoMapper;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Guests.Commands.UpdateGuest
{
    public class UpdateGuestCommand : IRequest
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string IdentificationNumber { get; set; } = string.Empty;
    }

    public class UpdateGuestCommandHandler : IRequestHandler<UpdateGuestCommand>
    {
        private readonly IGenericRepository<Guest> _repository;
        private readonly IMapper _mapper;

        public UpdateGuestCommandHandler(IGenericRepository<Guest> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task Handle(UpdateGuestCommand request, CancellationToken cancellationToken)
        {
            var guest = await _repository.GetByIdAsync(Guid.Parse(request.Id));
            if (guest == null)
            {
                // Handle not found
                return;
            }

            _mapper.Map(request, guest);
            await _repository.UpdateAsync(guest);
        }
    }
}
