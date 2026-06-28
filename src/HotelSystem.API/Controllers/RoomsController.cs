using HotelSystem.API.Controllers;
using HotelSystem.Application.DTOs;
using HotelSystem.Application.Features.Rooms.Commands.CreateRoom;
using HotelSystem.Application.Features.Rooms.Commands.UpdateRoom;
using HotelSystem.Application.Features.Rooms.Commands.ToggleRoomActive;
using HotelSystem.Application.Features.Rooms.Commands.UpdateRoomStatus;
using HotelSystem.Application.Features.Rooms.Queries.GetAllRooms;
using HotelSystem.Application.Features.Rooms.Queries.GetRoomById;
using HotelSystem.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RoomsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List<RoomDto>>> GetAll()
        {
            return Ok(await _mediator.Send(new GetAllRoomsQuery()));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDto>> GetById(Guid id)
        {
            var room = await _mediator.Send(new GetRoomByIdQuery(id));
            if (room == null) return NotFound();
            return Ok(room);
        }

        [HttpPost]
        public async Task<ActionResult<RoomDto>> Create([FromBody] CreateRoomCommand command)
        {
            return Ok(await _mediator.Send(command));
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateRoomStatusCommand command)
        {
            if (id != command.RoomId) 
                return BadRequest();
                
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoomCommand command)
        {
            if (id != command.Id)
                return BadRequest();

            await _mediator.Send(command);
            return NoContent();
        }

        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(Guid id)
        {
            await _mediator.Send(new ToggleRoomActiveCommand { Id = id });
            return NoContent();
        }
    }
}
