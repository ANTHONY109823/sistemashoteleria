using HotelSystem.Application.DTOs;

namespace HotelSystem.Application.Interfaces
{
    public interface IPdfService
    {
        Task<byte[]> GenerateInvoicePdfAsync(InvoiceDto invoice, string hotelName, string hotelAddress, string hotelPhone, string currencySymbol);
    }
}
