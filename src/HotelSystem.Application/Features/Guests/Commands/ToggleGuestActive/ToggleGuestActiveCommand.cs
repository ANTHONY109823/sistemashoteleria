using MediatR;

namespace HotelSystem.Application.Features.Guests.Commands.ToggleGuestActive
{
    public class ToggleGuestActiveCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}
