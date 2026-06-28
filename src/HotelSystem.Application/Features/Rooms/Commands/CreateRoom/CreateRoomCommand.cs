using AutoMapper;
using FluentValidation;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.Rooms.Commands.CreateRoom
{
    public class CreateRoomCommand : IRequest<RoomDto>
    {
        public string Number { get; set; } = string.Empty;
        public Guid RoomTypeId { get; set; }
        public int Floor { get; set; }
    }

    public class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
    {
        public CreateRoomCommandValidator()
        {
            RuleFor(p => p.Number)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(10).WithMessage("{PropertyName} must not exceed 10 characters.");

            RuleFor(p => p.RoomTypeId)
                .NotEmpty().WithMessage("{PropertyName} is required.");
        }
    }

    public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, RoomDto>
    {
        private readonly IGenericRepository<Room> _roomRepository;
        private readonly IMapper _mapper;

        public CreateRoomCommandHandler(IGenericRepository<Room> roomRepository, IMapper mapper)
        {
            _roomRepository = roomRepository;
            _mapper = mapper;
        }

        public async Task<RoomDto> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
        {
            var room = _mapper.Map<Room>(request);
            var result = await _roomRepository.AddAsync(room);
            return _mapper.Map<RoomDto>(result);
        }
    }
}
