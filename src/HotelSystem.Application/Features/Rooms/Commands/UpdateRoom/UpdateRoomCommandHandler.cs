using AutoMapper;
using FluentValidation;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Rooms.Commands.UpdateRoom
{
    public class UpdateRoomCommandValidator : AbstractValidator<UpdateRoomCommand>
    {
        public UpdateRoomCommandValidator()
        {
            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.Number)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(10).WithMessage("{PropertyName} must not exceed 10 characters.");

            RuleFor(p => p.RoomTypeId)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.Floor)
                .GreaterThanOrEqualTo(0).WithMessage("{PropertyName} must be 0 or greater.");
        }
    }

    public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, Unit>
    {
        private readonly IGenericRepository<Room> _roomRepository;

        public UpdateRoomCommandHandler(IGenericRepository<Room> roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<Unit> Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
        {
            var room = await _roomRepository.GetByIdAsync(request.Id);
            
            if (room == null)
                throw new KeyNotFoundException($"Room with ID {request.Id} not found.");

            // Update properties
            room.Number = request.Number;
            room.RoomTypeId = request.RoomTypeId;
            room.Floor = request.Floor;

            await _roomRepository.UpdateAsync(room);
            return Unit.Value;
        }
    }
}
