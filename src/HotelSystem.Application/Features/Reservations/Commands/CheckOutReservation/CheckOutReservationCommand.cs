using MediatR;
using System;

using System.Collections.Generic;
using HotelSystem.Domain.Enums;
using HotelSystem.Application.DTOs;
using HotelSystem.Application.Features.Invoices.Commands.CreateInvoice;

namespace HotelSystem.Application.Features.Reservations.Commands.CheckOutReservation
{
    public class CheckOutReservationCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public List<CreateInvoiceItemRequest> ExtraItems { get; set; } = new();
        public string Notes { get; set; } = string.Empty;
    }
}
