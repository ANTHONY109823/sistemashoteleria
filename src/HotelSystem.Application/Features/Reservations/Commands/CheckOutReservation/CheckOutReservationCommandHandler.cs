using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

using HotelSystem.Application.Features.Invoices.Commands.CreateInvoice;

namespace HotelSystem.Application.Features.Reservations.Commands.CheckOutReservation
{
    public class CheckOutReservationCommandHandler : IRequestHandler<CheckOutReservationCommand, bool>
    {
        private readonly IGenericRepository<Reservation> _reservationRepository;
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IMediator _mediator;

        public CheckOutReservationCommandHandler(
            IGenericRepository<Reservation> reservationRepository,
            IGenericRepository<Room> roomRepository,
            IMediator mediator)
        {
            _reservationRepository = reservationRepository;
            _roomRepository = roomRepository;
            _mediator = mediator;
        }

        public async Task<bool> Handle(CheckOutReservationCommand request, CancellationToken cancellationToken)
        {
            var reservation = await _reservationRepository.GetByIdAsync(request.Id);

            if (reservation == null)
            {
                throw new Exception("Reservation not found");
            }

            if (reservation.Status != ReservationStatus.CheckedIn)
            {
                throw new Exception($"Cannot check-out reservation. Current status: {reservation.Status}. Status must be CheckedIn.");
            }

            reservation.Status = ReservationStatus.CheckedOut;
            reservation.CheckOutDate = DateTime.UtcNow;
            
            await _reservationRepository.UpdateAsync(reservation);

            // Change Room Status to Cleaning
            var room = await _roomRepository.GetByIdAsync(reservation.RoomId);
            if (room != null)
            {
                room.Status = RoomStatus.Cleaning;
                await _roomRepository.UpdateAsync(room);
            }

            // Generate Invoice via Mediator
            var invoiceCommand = new CreateInvoiceCommand
            {
                ReservationId = reservation.Id,
                PaymentMethod = request.PaymentMethod,
                ExtraItems = request.ExtraItems,
                Notes = request.Notes
            };

            await _mediator.Send(invoiceCommand, cancellationToken);

            return true;
        }
    }
}
