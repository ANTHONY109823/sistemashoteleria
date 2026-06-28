using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Invoices.Queries.GetInvoicesByReservation
{
    public class GetInvoicesByReservationQuery : IRequest<List<InvoiceDto>>
    {
        public Guid ReservationId { get; set; }
    }

    public class GetInvoicesByReservationQueryHandler : IRequestHandler<GetInvoicesByReservationQuery, List<InvoiceDto>>
    {
        private readonly IGenericRepository<Invoice> _invoiceRepository;
        private readonly IGenericRepository<Guest> _guestRepository;

        public GetInvoicesByReservationQueryHandler(
            IGenericRepository<Invoice> invoiceRepository,
            IGenericRepository<Guest> guestRepository)
        {
            _invoiceRepository = invoiceRepository;
            _guestRepository = guestRepository;
        }

        public async Task<List<InvoiceDto>> Handle(GetInvoicesByReservationQuery request, CancellationToken cancellationToken)
        {
            var invoices = await _invoiceRepository.GetAsync(
                i => i.ReservationId == request.ReservationId,
                "Items,Guest,Reservation,Reservation.Room,Reservation.Room.RoomType");

            var result = new List<InvoiceDto>();
            foreach (var invoice in invoices)
            {
                var guest = invoice.Guest ?? await _guestRepository.GetByIdAsync(invoice.GuestId);
                var room = invoice.Reservation?.Room;

                result.Add(new InvoiceDto
                {
                    Id = invoice.Id,
                    ReservationId = invoice.ReservationId,
                    GuestId = invoice.GuestId,
                    GuestName = guest != null ? $"{guest.FirstName} {guest.LastName}" : "N/A",
                    GuestEmail = guest?.Email ?? string.Empty,
                    GuestPhone = guest?.Phone ?? string.Empty,
                    GuestIdentificationNumber = guest?.IdentificationNumber ?? string.Empty,
                    RoomNumber = room?.Number ?? string.Empty,
                    RoomTypeName = room?.RoomType?.Name ?? string.Empty,
                    CheckInDate = invoice.Reservation?.CheckInDate ?? DateTime.MinValue,
                    CheckOutDate = invoice.Reservation?.CheckOutDate ?? DateTime.MinValue,
                    InvoiceNumber = invoice.InvoiceNumber,
                    SubTotal = invoice.SubTotal,
                    TaxRate = invoice.TaxRate,
                    TaxAmount = invoice.TaxAmount,
                    TotalAmount = invoice.TotalAmount,
                    PaymentMethod = invoice.PaymentMethod,
                    PaymentStatus = invoice.PaymentStatus,
                    PaidAt = invoice.PaidAt,
                    Notes = invoice.Notes,
                    CreatedAt = invoice.CreatedAt,
                    Items = invoice.Items.Select(i => new InvoiceItemDto
                    {
                        Id = i.Id,
                        Description = i.Description,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        Total = i.Total
                    }).ToList()
                });
            }

            return result;
        }
    }
}
