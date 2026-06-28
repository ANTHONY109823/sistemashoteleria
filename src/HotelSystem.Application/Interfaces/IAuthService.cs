using HotelSystem.Application.DTOs;

namespace HotelSystem.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> Login(AuthRequest request);
        Task ChangePassword(string userId, string currentPassword, string newPassword);
        Task<AuthResponse> RefreshTokenAsync(string refreshToken);
        Task RevokeRefreshTokenAsync(string refreshToken);
    }
}
