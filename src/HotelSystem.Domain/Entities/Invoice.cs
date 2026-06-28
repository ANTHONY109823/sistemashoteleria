using HotelSystem.Domain.Common;
using HotelSystem.Domain.Enums;

namespace HotelSystem.Domain.Entities
{
    public class Invoice : Entity
    {
        public Guid ReservationId { get; set; }
        public Reservation? Reservation { get; set; }

        public Guid GuestId { get; set; }
        public Guest? Guest { get; set; }

        public string InvoiceNumber { get; set; } = string.Empty;

        public decimal SubTotal { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        public DateTime? PaidAt { get; set; }
        public string Notes { get; set; } = string.Empty;

        public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    }
}
