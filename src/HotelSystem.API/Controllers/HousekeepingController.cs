using HotelSystem.Application.Features.Housekeeping.Commands.AssignTask;
using HotelSystem.Application.Features.Housekeeping.Commands.CreateTask;
using HotelSystem.Application.Features.Housekeeping.Commands.UpdateTaskStatus;
using HotelSystem.Application.Features.Housekeeping.Queries.GetAllTasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class HousekeepingController : ControllerBase
    {
        private readonly IMediator _mediator;

        public HousekeepingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Obtiene todas las tareas de housekeeping, con filtro opcional de estado.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult> GetAll([FromQuery] string? status = null)
        {
            try
            {
                var result = await _mediator.Send(new GetAllTasksQuery { StatusFilter = status });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Crea una nueva tarea de housekeeping.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateTaskCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Asigna una tarea a un usuario (camarista).
        /// </summary>
        [HttpPut("{id:guid}/assign")]
        public async Task<ActionResult> Assign(Guid id, [FromBody] AssignTaskCommand command)
        {
            command.TaskId = id;
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Actualiza el estado de una tarea (InProgress, Completed, Skipped).
        /// </summary>
        [HttpPut("{id:guid}/status")]
        public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusCommand command)
        {
            command.TaskId = id;
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
