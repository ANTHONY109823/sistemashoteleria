using HotelSystem.Application.Features.Guests.Commands.CreateGuest;
using HotelSystem.Application.Features.Guests.Commands.UpdateGuest;
using HotelSystem.Application.Features.Guests.Commands.ToggleGuestActive;
using HotelSystem.Application.Features.Guests.Queries.GetAllGuests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GuestsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GuestsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _mediator.Send(new GetAllGuestsQuery()));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateGuestCommand command)
        {
            return Ok(await _mediator.Send(command));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, UpdateGuestCommand command)
        {
            if (id != command.Id)
                return BadRequest();

            await _mediator.Send(command);
            return NoContent();
        }

        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive([FromRoute] Guid id)
        {
            var result = await _mediator.Send(new ToggleGuestActiveCommand { Id = id });
            return Ok(result);
        }
    }
}
