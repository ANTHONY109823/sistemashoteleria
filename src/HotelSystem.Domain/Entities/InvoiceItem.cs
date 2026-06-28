using HotelSystem.Domain.Common;

namespace HotelSystem.Domain.Entities
{
    public class InvoiceItem : Entity
    {
        public Guid InvoiceId { get; set; }
        public Invoice? Invoice { get; set; }

        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
    }
}
