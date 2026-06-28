using HotelSystem.Application.DTOs;
using HotelSystem.Application.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HotelSystem.Infrastructure.Services
{
    public class PdfService : IPdfService
    {
        public PdfService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public Task<byte[]> GenerateInvoicePdfAsync(
            InvoiceDto invoice,
            string hotelName,
            string hotelAddress,
            string hotelPhone,
            string currencySymbol)
        {
            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header().Element(ComposeHeader(hotelName, hotelAddress, hotelPhone, invoice));
                    page.Content().Element(ComposeContent(invoice, currencySymbol));
                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Generado por Sistema de Hotelería • ").FontColor(Colors.Grey.Medium);
                        text.CurrentPageNumber().FontColor(Colors.Grey.Medium);
                        text.Span(" / ").FontColor(Colors.Grey.Medium);
                        text.TotalPages().FontColor(Colors.Grey.Medium);
                    });
                });
            });

            var bytes = pdf.GeneratePdf();
            return Task.FromResult(bytes);
        }

        private Action<IContainer> ComposeHeader(string hotelName, string hotelAddress, string hotelPhone, InvoiceDto invoice)
        {
            return container =>
            {
                container.Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text(hotelName).FontSize(20).Bold().FontColor(Colors.DeepPurple.Darken2);
                        col.Item().Text(hotelAddress).FontColor(Colors.Grey.Darken1);
                        col.Item().Text(hotelPhone).FontColor(Colors.Grey.Darken1);
                    });

                    row.ConstantItem(160).Column(col =>
                    {
                        col.Item().AlignRight().Text("FACTURA").FontSize(22).Bold().FontColor(Colors.DeepPurple.Darken2);
                        col.Item().AlignRight().Text($"#{invoice.InvoiceNumber}").FontSize(13).Bold();
                        col.Item().AlignRight().Text($"Fecha: {invoice.CreatedAt:dd/MM/yyyy}").FontColor(Colors.Grey.Darken1);
                        col.Item().AlignRight().Text($"Pago: {GetPaymentMethodLabel(invoice.PaymentMethod)}").FontColor(Colors.Grey.Darken1);
                    });
                });

                container.PaddingTop(10).LineHorizontal(1.5f).LineColor(Colors.DeepPurple.Lighten3);
            };
        }

        private Action<IContainer> ComposeContent(InvoiceDto invoice, string currencySymbol)
        {
            return container =>
            {
                container.PaddingTop(20).Column(col =>
                {
                    // Guest Info
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(guestCol =>
                        {
                            guestCol.Item().Text("FACTURADO A:").Bold().FontColor(Colors.DeepPurple.Darken1);
                            guestCol.Item().Text(invoice.GuestName).Bold();
                            guestCol.Item().Text($"Doc: {invoice.GuestIdentificationNumber}");
                            guestCol.Item().Text(invoice.GuestEmail);
                            guestCol.Item().Text(invoice.GuestPhone);
                        });

                        row.ConstantItem(200).Column(resCol =>
                        {
                            resCol.Item().Text("DETALLES DE ESTADÍA:").Bold().FontColor(Colors.DeepPurple.Darken1);
                            resCol.Item().Text($"Habitación: {invoice.RoomNumber} ({invoice.RoomTypeName})");
                            resCol.Item().Text($"Check-in: {invoice.CheckInDate:dd/MM/yyyy}");
                            resCol.Item().Text($"Check-out: {invoice.CheckOutDate:dd/MM/yyyy}");
                            var nights = (invoice.CheckOutDate - invoice.CheckInDate).Days;
                            resCol.Item().Text($"Noches: {nights}");
                        });
                    });

                    col.Item().PaddingTop(20);

                    // Items Table
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(4);
                            cols.RelativeColumn(1);
                            cols.RelativeColumn(2);
                            cols.RelativeColumn(2);
                        });

                        // Header
                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.DeepPurple.Darken2).Padding(8).Text("Descripción").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.DeepPurple.Darken2).Padding(8).AlignCenter().Text("Cant.").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.DeepPurple.Darken2).Padding(8).AlignRight().Text("Precio Unit.").FontColor(Colors.White).Bold();
                            header.Cell().Background(Colors.DeepPurple.Darken2).Padding(8).AlignRight().Text("Total").FontColor(Colors.White).Bold();
                        });

                        // Items
                        bool alternate = false;
                        foreach (var item in invoice.Items)
                        {
                            var bg = alternate ? Colors.Grey.Lighten4 : Colors.White;
                            table.Cell().Background(bg).Padding(8).Text(item.Description);
                            table.Cell().Background(bg).Padding(8).AlignCenter().Text(item.Quantity.ToString());
                            table.Cell().Background(bg).Padding(8).AlignRight().Text($"{currencySymbol}{item.UnitPrice:N2}");
                            table.Cell().Background(bg).Padding(8).AlignRight().Text($"{currencySymbol}{item.Total:N2}");
                            alternate = !alternate;
                        }
                    });

                    // Totals
                    col.Item().PaddingTop(10).AlignRight().Column(totals =>
                    {
                        totals.Item().Row(r =>
                        {
                            r.ConstantItem(120).Text("Subtotal:").AlignRight();
                            r.ConstantItem(100).Text($"{currencySymbol}{invoice.SubTotal:N2}").AlignRight();
                        });
                        totals.Item().Row(r =>
                        {
                            r.ConstantItem(120).Text($"IGV ({invoice.TaxRate * 100:N0}%):").AlignRight();
                            r.ConstantItem(100).Text($"{currencySymbol}{invoice.TaxAmount:N2}").AlignRight();
                        });
                        totals.Item().PaddingTop(4).Row(r =>
                        {
                            r.ConstantItem(120).Text("TOTAL:").AlignRight().Bold().FontSize(13).FontColor(Colors.DeepPurple.Darken2);
                            r.ConstantItem(100).Text($"{currencySymbol}{invoice.TotalAmount:N2}").AlignRight().Bold().FontSize(13).FontColor(Colors.DeepPurple.Darken2);
                        });
                    });

                    if (!string.IsNullOrEmpty(invoice.Notes))
                    {
                        col.Item().PaddingTop(20).Text($"Notas: {invoice.Notes}").FontColor(Colors.Grey.Darken1).Italic();
                    }

                    col.Item().PaddingTop(20).Text("¡Gracias por su preferencia!").AlignCenter().FontColor(Colors.DeepPurple.Darken1).Bold();
                });
            };
        }

        private static string GetPaymentMethodLabel(Domain.Enums.PaymentMethod method) => method switch
        {
            Domain.Enums.PaymentMethod.Cash => "Efectivo",
            Domain.Enums.PaymentMethod.Card => "Tarjeta",
            Domain.Enums.PaymentMethod.Transfer => "Transferencia",
            _ => "Otro"
        };
    }
}
