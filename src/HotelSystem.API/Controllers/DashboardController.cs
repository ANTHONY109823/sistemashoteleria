using HotelSystem.Application.DTOs;
using HotelSystem.Application.Features.Dashboard.Queries.GetDashboardStats;
using HotelSystem.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace HotelSystem.API.Controllers
{
    // [Authorize] // Temporarily disabled for testing
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("Stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            return Ok(await _mediator.Send(new GetDashboardStatsQuery()));
        }

        [HttpGet("StatsComparison")]
        public async Task<ActionResult<DashboardStatsComparisonDto>> GetStatsComparison(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int previousPeriodDays = 30)
        {
            var service = HttpContext.RequestServices.GetRequiredService<IDashboardService>();
            return Ok(await service.GetStatsComparison(startDate, endDate, previousPeriodDays));
        }

        [HttpGet("RevenueChart")]
        public async Task<ActionResult<List<RevenueChartDataDto>>> GetRevenueChart(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var service = HttpContext.RequestServices.GetRequiredService<IDashboardService>();
            return Ok(await service.GetRevenueChart(startDate, endDate));
        }
    }
}
