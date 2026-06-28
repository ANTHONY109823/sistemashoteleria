using HotelSystem.Application.DTOs;
using HotelSystem.Application.Features.RoomTypes.Commands.CreateRoomType;
using HotelSystem.Application.Features.RoomTypes.Commands.UpdateRoomType;
using HotelSystem.Application.Features.RoomTypes.Commands.ToggleRoomTypeActive;
using HotelSystem.Application.Features.RoomTypes.Queries.GetAllRoomTypes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RoomTypesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RoomTypesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List<RoomTypeDto>>> GetAll()
        {
            return Ok(await _mediator.Send(new GetAllRoomTypesQuery()));
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> Create([FromBody] CreateRoomTypeCommand command)
        {
            if (!ModelState.IsValid)
            {
                 var errors = string.Join("; ", ModelState.Values
                                        .SelectMany(x => x.Errors)
                                        .Select(x => x.ErrorMessage));
                 return BadRequest($"Validation Failed: {errors}");
            }

            try 
            {
                return Ok(await _mediator.Send(command));
            }
            catch (Exception ex)
            {
                return BadRequest($"Server Error: {ex.Message} {ex.InnerException?.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<bool>> Update(Guid id, [FromBody] UpdateRoomTypeCommand command)
        {
            if (id != command.Id)
                return BadRequest($"Id mismatch: URL ID = {id}, Body ID = {command.Id}");

            if (!ModelState.IsValid)
            {
                 var errors = string.Join("; ", ModelState.Values
                                        .SelectMany(x => x.Errors)
                                        .Select(x => x.ErrorMessage));
                 return BadRequest($"Validation Failed: {errors}");
            }

            try
            {
                return Ok(await _mediator.Send(command));
            }
            catch (Exception ex)
            {
                return BadRequest($"Server Error: {ex.Message} {ex.InnerException?.Message}");
            }
        }

        [HttpPatch("{id}/toggle-active")]
        public async Task<ActionResult<bool>> ToggleActive(Guid id)
        {
            return Ok(await _mediator.Send(new ToggleRoomTypeActiveCommand { Id = id }));
        }
    }
}
