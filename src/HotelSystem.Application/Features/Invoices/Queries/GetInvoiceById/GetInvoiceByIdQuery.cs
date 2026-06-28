using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Invoices.Queries.GetInvoiceById
{
    public class GetInvoiceByIdQuery : IRequest<InvoiceDto?>
    {
        public Guid Id { get; set; }
    }

    public class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, InvoiceDto?>
    {
        private readonly IGenericRepository<Invoice> _invoiceRepository;
        private readonly IGenericRepository<Guest> _guestRepository;
        private readonly IGenericRepository<Room> _roomRepository;

        public GetInvoiceByIdQueryHandler(
            IGenericRepository<Invoice> invoiceRepository,
            IGenericRepository<Guest> guestRepository,
            IGenericRepository<Room> roomRepository)
        {
            _invoiceRepository = invoiceRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
        }

        public async Task<InvoiceDto?> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(request.Id, "Items,Guest,Reservation,Reservation.Room,Reservation.Room.RoomType");
            if (invoice == null) return null;

            var guest = invoice.Guest ?? await _guestRepository.GetByIdAsync(invoice.GuestId);
            var reservations = await _invoiceRepository.GetAsync(i => i.Id == invoice.Id);
            var room = invoice.Reservation?.Room;

            return new InvoiceDto
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
            };
        }
    }
}
