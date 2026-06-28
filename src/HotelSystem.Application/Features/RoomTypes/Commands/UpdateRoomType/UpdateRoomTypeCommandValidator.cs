using FluentValidation;

namespace HotelSystem.Application.Features.RoomTypes.Commands.UpdateRoomType
{
    public class UpdateRoomTypeCommandValidator : AbstractValidator<UpdateRoomTypeCommand>
    {
        public UpdateRoomTypeCommandValidator()
        {
            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.");

            RuleFor(p => p.BasePrice)
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");
            
            RuleFor(p => p.Capacity)
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");
        }
    }
}
