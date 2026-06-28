using HotelSystem.Application.DTOs;
using HotelSystem.Application.Features.Reservations.Commands.CancelReservation;
using HotelSystem.Application.Features.Reservations.Commands.CreateReservation;
using HotelSystem.Application.Features.Reservations.Commands.CheckInReservation;
using HotelSystem.Application.Features.Reservations.Commands.CheckOutReservation;
using HotelSystem.Application.Features.Reservations.Commands.UpdateReservation;
using HotelSystem.Application.Features.Reservations.Commands.MarkNoShow;
using HotelSystem.Application.Features.Reservations.Queries.GetReservations;
using HotelSystem.Application.Features.Reservations.Queries.SearchReservations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReservationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ReservationDto>>> GetAll()
        {
            return Ok(await _mediator.Send(new GetAllReservationsQuery()));
        }

        [HttpGet("search")]
        public async Task<ActionResult<PagedResult<ReservationDto>>> Search(
            [FromQuery] string? query,
            [FromQuery] string? status,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var searchQuery = new SearchReservationsQuery
            {
                Query = query,
                Status = status,
                DateFrom = dateFrom,
                DateTo = dateTo,
                Page = page,
                PageSize = pageSize
            };
            return Ok(await _mediator.Send(searchQuery));
        }

        [HttpPost]
        public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationCommand command)
        {
            try
            {
                return Ok(await _mediator.Send(command));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ReservationDto>> Cancel(string id)
        {
            try
            {
                var command = new CancelReservationCommand { Id = id };
                return Ok(await _mediator.Send(command));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("{id}/checkin")]
        public async Task<ActionResult<bool>> CheckIn(Guid id)
        {
            try
            {
                var command = new CheckInReservationCommand { Id = id };
                return Ok(await _mediator.Send(command));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/checkout")]
        public async Task<ActionResult<bool>> CheckOut(Guid id, [FromBody] CheckOutReservationCommand? command)
        {
            try
            {
                if (command == null) command = new CheckOutReservationCommand();
                command.Id = id;
                return Ok(await _mediator.Send(command));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ReservationDto>> Update(Guid id, [FromBody] UpdateReservationCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("ID mismatch");
            }

            try
            {
                return Ok(await _mediator.Send(command));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Marca una reservación confirmada como No-Show y libera la habitación.
        /// </summary>
        [HttpPost("{id:guid}/noshow")]
        public async Task<ActionResult<bool>> MarkNoShow(Guid id)
        {
            try
            {
                var result = await _mediator.Send(new MarkNoShowCommand { Id = id });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
