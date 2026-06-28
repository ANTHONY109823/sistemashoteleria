using HotelSystem.Application.DTOs;
using HotelSystem.Application.Features.Auth.Commands.Login;
using HotelSystem.Application.Features.Auth.Commands.ChangePassword;
using HotelSystem.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuditService _auditService;
        private readonly IAuthService _authService;

        public AuthController(IMediator mediator, IAuditService auditService, IAuthService authService)
        {
            _mediator = mediator;
            _auditService = auditService;
            _authService = authService;
        }

        [HttpPost("Login")]
        [ProducesResponseType(typeof(AuthResponse), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] AuthRequest request)
        {
            try
            {
                var response = await _mediator.Send(new LoginCommand { Email = request.Email, Password = request.Password });

                await _auditService.LogAction(
                    response.Id,
                    response.UserName ?? response.Email,
                    "Login",
                    "Auth",
                    response.Id,
                    null,
                    "User logged in successfully",
                    HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("ChangePassword")]
        [Authorize]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not identified");

                await _mediator.Send(new ChangePasswordCommand
                {
                    UserId = userId,
                    CurrentPassword = request.CurrentPassword,
                    NewPassword = request.NewPassword
                });

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Renueva el access token usando el token actual (sin expirar o recién expirado).
        /// </summary>
        [HttpPost("RefreshToken")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(request.RefreshToken);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cierra sesión. El cliente debe descartar el token localmente.
        /// </summary>
        [HttpPost("Logout")]
        [Authorize]
        public async Task<ActionResult> Logout()
        {
            try
            {
                var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                await _authService.RevokeRefreshTokenAsync(token);
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
