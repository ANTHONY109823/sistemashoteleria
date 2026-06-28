using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Reservations.Queries.SearchReservations;

public class SearchReservationsQuery : IRequest<PagedResult<ReservationDto>>
{
    public string? Query { get; set; }
    public string? Status { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class SearchReservationsQueryHandler : IRequestHandler<SearchReservationsQuery, PagedResult<ReservationDto>>
{
    private readonly IGenericRepository<HotelSystem.Domain.Entities.Reservation> _reservationRepository;
    private readonly AutoMapper.IMapper _mapper;

    public SearchReservationsQueryHandler(
        Domain.Interfaces.IGenericRepository<Domain.Entities.Reservation> reservationRepository,
        AutoMapper.IMapper mapper)
    {
        _reservationRepository = reservationRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<ReservationDto>> Handle(SearchReservationsQuery request, CancellationToken cancellationToken)
    {
        // Get all reservations with includes
        var allReservations = await _reservationRepository.GetAllAsync("Guest,Room,Room.RoomType");

        // Apply filters using LINQ
        var query = allReservations.AsQueryable().Where(r =>
            // Text search: Guest name or Room number or Reservation ID
            (string.IsNullOrEmpty(request.Query) ||
             (r.Guest != null && (r.Guest.FirstName + " " + r.Guest.LastName).ToLower().Contains(request.Query.ToLower())) ||
             (r.Room != null && r.Room.Number.ToLower().Contains(request.Query.ToLower())) ||
             r.Id.ToString().Contains(request.Query)) &&
            // Status filter
            (string.IsNullOrEmpty(request.Status) ||
             r.Status.ToString().ToLower() == request.Status.ToLower()) &&
            // Date range filter (check-in)
            (!request.DateFrom.HasValue || r.CheckInDate >= request.DateFrom.Value) &&
            (!request.DateTo.HasValue || r.CheckInDate <= request.DateTo.Value)
        );

        // Order by check-in date descending
        query = query.OrderByDescending(r => r.CheckInDate);

        var totalCount = query.Count();

        // Apply pagination
        var items = query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var reservationDtos = _mapper.Map<List<ReservationDto>>(items);

        // Populate additional fields
        foreach (var dto in reservationDtos)
        {
            var reservation = items.First(r => r.Id == dto.Id);
            dto.GuestName = reservation.Guest != null ? $"{reservation.Guest.FirstName} {reservation.Guest.LastName}" : "N/A";
            dto.RoomNumber = reservation.Room?.Number ?? "N/A";
        }

        return new PagedResult<ReservationDto>
        {
            Items = reservationDtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
