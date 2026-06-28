using MediatR;
using HotelSystem.Domain.Interfaces;
using HotelSystem.Domain.Entities;

namespace HotelSystem.Application.Features.Guests.Commands.ToggleGuestActive
{
    public class ToggleGuestActiveCommandHandler : IRequestHandler<ToggleGuestActiveCommand, bool>
    {
        private readonly IGenericRepository<Guest> _guestRepository;

        public ToggleGuestActiveCommandHandler(IGenericRepository<Guest> guestRepository)
        {
            _guestRepository = guestRepository;
        }

        public async Task<bool> Handle(ToggleGuestActiveCommand request, CancellationToken cancellationToken)
        {
            var guest = await _guestRepository.GetByIdAsync(request.Id);
            if (guest == null)
            {
                throw new KeyNotFoundException($"Guest with ID {request.Id} not found.");
            }

            guest.IsActive = !guest.IsActive;
            await _guestRepository.UpdateAsync(guest);
            return guest.IsActive;
        }
    }
}
