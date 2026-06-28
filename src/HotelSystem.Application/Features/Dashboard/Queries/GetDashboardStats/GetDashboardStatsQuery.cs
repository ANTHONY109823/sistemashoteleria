using HotelSystem.Application.DTOs;
using HotelSystem.Application.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Dashboard.Queries.GetDashboardStats
{
    public class GetDashboardStatsQuery : IRequest<DashboardStatsDto>
    {
    }

    public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
    {
        private readonly IDashboardService _dashboardService;

        public GetDashboardStatsQueryHandler(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            return await _dashboardService.GetStats();
        }
    }
}

