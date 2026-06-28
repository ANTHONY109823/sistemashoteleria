using AutoMapper;
using HotelSystem.Domain.Entities;
using HotelSystem.Application.DTOs;
using HotelSystem.Application.Features.Rooms.Commands.CreateRoom;
using HotelSystem.Application.Features.RoomTypes.Commands.CreateRoomType;
using HotelSystem.Application.Features.Guests.Commands.CreateGuest;
using HotelSystem.Application.Features.Guests.Commands.UpdateGuest;

namespace HotelSystem.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Room, RoomDto>()
                .ForMember(dest => dest.RoomTypeName, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.Name : string.Empty))
                .ForMember(dest => dest.PricePerNight, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.BasePrice : 0))
                .ReverseMap();

            CreateMap<CreateRoomCommand, Room>();

            CreateMap<RoomType, RoomTypeDto>().ReverseMap();
            CreateMap<CreateRoomTypeCommand, RoomType>();

            CreateMap<Guest, GuestDto>()
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ReverseMap();
            CreateMap<CreateGuestCommand, Guest>();
            CreateMap<UpdateGuestCommand, Guest>();
            CreateMap<Reservation, ReservationDto>()
                .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => src.Guest != null ? $"{src.Guest.FirstName} {src.Guest.LastName}" : string.Empty))
                .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.Room != null ? src.Room.Number : string.Empty))
                .ReverseMap();
        }
    }
}
