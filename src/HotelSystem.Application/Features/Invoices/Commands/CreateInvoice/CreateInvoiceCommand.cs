using HotelSystem.Application.DTOs;
using HotelSystem.Application.Interfaces;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Invoices.Commands.CreateInvoice
{
    public class CreateInvoiceCommand : IRequest<InvoiceDto>
    {
        public Guid ReservationId { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public List<CreateInvoiceItemRequest> ExtraItems { get; set; } = new();
        public string Notes { get; set; } = string.Empty;
    }

    public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, InvoiceDto>
    {
        private readonly IGenericRepository<Invoice> _invoiceRepository;
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Guest> _guestRepository;
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IGenericRepository<Settings> _settingsRepository;

        public CreateInvoiceCommandHandler(
            IGenericRepository<Invoice> invoiceRepository,
            IGenericRepository<Reservation> reservationRepository,
            IGenericRepository<Guest> guestRepository,
            IGenericRepository<Room> roomRepository,
            IGenericRepository<Settings> settingsRepository)
        {
            _invoiceRepository = invoiceRepository;
            _reservationRepository = reservationRepository;
            _guestRepository = guestRepository;
            _roomRepository = roomRepository;
            _settingsRepository = settingsRepository;
        }

        public async Task<InvoiceDto> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
        {
            var reservation = await _reservationRepository.GetByIdAsync(request.ReservationId, "Guest,Room,Room.RoomType");
            if (reservation == null) throw new Exception("Reservation not found");

            var guest = reservation.Guest ?? await _guestRepository.GetByIdAsync(reservation.GuestId);
            var room = reservation.Room ?? await _roomRepository.GetByIdAsync(reservation.RoomId, "RoomType");

            // Get tax rate from settings
            var settingsList = await _settingsRepository.GetAllAsync();
            var settings = settingsList.FirstOrDefault();
            decimal taxRate = 0.18m; // 18% default IGV

            // Auto-generate invoice number
            var allInvoices = await _invoiceRepository.GetAllAsync();
            int nextNum = allInvoices.Count() + 1;
            string invoiceNumber = $"INV-{DateTime.UtcNow.Year}-{nextNum:D4}";

            // Line items
            var items = new List<InvoiceItem>();
            decimal subTotal = 0;

            // Accommodation line
            var nights = (reservation.CheckOutDate - reservation.CheckInDate).Days;
            var pricePerNight = room?.RoomType?.BasePrice ?? 0;
            var accommodationTotal = nights * pricePerNight;
            items.Add(new InvoiceItem
            {
                Description = $"Alojamiento - Hab. {room?.Number} x {nights} noche(s)",
                Quantity = nights,
                UnitPrice = pricePerNight,
                Total = accommodationTotal
            });
            subTotal += accommodationTotal;

            // Extra items
            foreach (var extra in request.ExtraItems)
            {
                var extraTotal = extra.Quantity * extra.UnitPrice;
                items.Add(new InvoiceItem
                {
                    Description = extra.Description,
                    Quantity = extra.Quantity,
                    UnitPrice = extra.UnitPrice,
                    Total = extraTotal
                });
                subTotal += extraTotal;
            }

            var taxAmount = subTotal * taxRate;
            var totalAmount = subTotal + taxAmount;

            var invoice = new Invoice
            {
                ReservationId = request.ReservationId,
                GuestId = reservation.GuestId,
                InvoiceNumber = invoiceNumber,
                SubTotal = subTotal,
                TaxRate = taxRate,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = PaymentStatus.Paid,
                PaidAt = DateTime.UtcNow,
                Notes = request.Notes,
                Items = items
            };

            await _invoiceRepository.AddAsync(invoice);

            return MapToDto(invoice, guest!, room!);
        }

        private InvoiceDto MapToDto(Invoice invoice, Guest guest, Room room)
        {
            return new InvoiceDto
            {
                Id = invoice.Id,
                ReservationId = invoice.ReservationId,
                GuestId = invoice.GuestId,
                GuestName = $"{guest.FirstName} {guest.LastName}",
                GuestEmail = guest.Email,
                GuestPhone = guest.Phone,
                GuestIdentificationNumber = guest.IdentificationNumber,
                RoomNumber = room.Number,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
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
