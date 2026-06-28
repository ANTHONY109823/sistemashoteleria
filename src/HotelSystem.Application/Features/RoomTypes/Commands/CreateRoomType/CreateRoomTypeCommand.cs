using AutoMapper;
using FluentValidation;
using HotelSystem.Application.DTOs;
using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Interfaces;
using MediatR;

namespace HotelSystem.Application.Features.RoomTypes.Commands.CreateRoomType
{
    public class CreateRoomTypeCommand : IRequest<RoomTypeDto>
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public int Capacity { get; set; }
        public string Color { get; set; } = "#2563eb";
    }

    public class CreateRoomTypeCommandValidator : AbstractValidator<CreateRoomTypeCommand>
    {
        public CreateRoomTypeCommandValidator()
        {
            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.");

            RuleFor(p => p.BasePrice)
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");
            
            RuleFor(p => p.Capacity)
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");
        }
    }

    public class CreateRoomTypeCommandHandler : IRequestHandler<CreateRoomTypeCommand, RoomTypeDto>
    {
        private readonly IGenericRepository<RoomType> _repository;
        private readonly IMapper _mapper;

        public CreateRoomTypeCommandHandler(IGenericRepository<RoomType> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<RoomTypeDto> Handle(CreateRoomTypeCommand request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<RoomType>(request);
            var result = await _repository.AddAsync(entity);
            return _mapper.Map<RoomTypeDto>(result);
        }
    }
}
