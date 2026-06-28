using HotelSystem.Application.Features.Invoices.Commands.CreateInvoice;
using HotelSystem.Application.Features.Invoices.Queries.GetInvoiceById;
using HotelSystem.Application.Features.Invoices.Queries.GetInvoicesByReservation;
using HotelSystem.Application.Features.Invoices.Queries.GetInvoices;
using HotelSystem.Application.Interfaces;
using HotelSystem.Domain.Interfaces;
using HotelSystem.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class InvoicesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IPdfService _pdfService;
        private readonly IGenericRepository<Settings> _settingsRepository;

        public InvoicesController(
            IMediator mediator,
            IPdfService pdfService,
            IGenericRepository<Settings> settingsRepository)
        {
            _mediator = mediator;
            _pdfService = pdfService;
            _settingsRepository = settingsRepository;
        }

        /// <summary>
        /// Obtiene todas las facturas.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var result = await _mediator.Send(new GetInvoicesQuery());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene una factura por su ID.
        /// </summary>
        [HttpGet("{id:guid}")]
        public async Task<ActionResult> GetById(Guid id)
        {
            try
            {
                var result = await _mediator.Send(new GetInvoiceByIdQuery { Id = id });
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene todas las facturas de una reservación.
        /// </summary>
        [HttpGet("reservation/{reservationId:guid}")]
        public async Task<ActionResult> GetByReservation(Guid reservationId)
        {
            try
            {
                var result = await _mediator.Send(new GetInvoicesByReservationQuery { ReservationId = reservationId });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Crea una nueva factura para una reservación.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateInvoiceCommand command)
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
        /// Genera y descarga el PDF de una factura.
        /// </summary>
        [HttpGet("{id:guid}/pdf")]
        public async Task<ActionResult> DownloadPdf(Guid id)
        {
            try
            {
                var invoice = await _mediator.Send(new GetInvoiceByIdQuery { Id = id });
                if (invoice == null) return NotFound();

                var settingsList = await _settingsRepository.GetAllAsync();
                var settings = settingsList.FirstOrDefault();

                var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(
                    invoice,
                    settings?.CompanyName ?? "Hotel Sistema",
                    settings?.Address ?? "",
                    settings?.Phone ?? "",
                    settings?.CurrencySymbol ?? "S/"
                );

                return File(pdfBytes, "application/pdf", $"Factura-{invoice.InvoiceNumber}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
