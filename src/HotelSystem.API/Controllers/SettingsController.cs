using HotelSystem.Domain.Entities;
using HotelSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly HotelDbContext _context;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(HotelDbContext context, ILogger<SettingsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/settings
    [HttpGet]
    public async Task<ActionResult<Settings>> GetSettings()
    {
        try
        {
            var settings = await _context.Settings.FirstOrDefaultAsync();

            if (settings == null)
            {
                // Create singleton default settings (Entity base sets Id automatically)
                settings = new Settings
                {
                    CompanyName = "Hotel Sistema",
                    Currency = "USD",
                    CurrencySymbol = "$",
                    TimeZone = "America/Lima",
                    DateFormat = "DD/MM/YYYY",
                    TimeFormat = "24h",
                    Language = "es",
                    SessionTimeout = 30,
                    DefaultCheckInTime = "15:00",
                    DefaultCheckOutTime = "11:00",
                    MaxGuestsPerRoom = 4,
                    EnableOnlineBookings = false,
                    TaxRate = 0.18m
                };

                _context.Settings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving settings");
            return StatusCode(500, "Error retrieving settings");
        }
    }

    // PUT: api/settings
    [HttpPut]
    [Authorize]
    public async Task<ActionResult<Settings>> UpdateSettings([FromBody] Settings updatedSettings)
    {
        try
        {
            var settings = await _context.Settings.FirstOrDefaultAsync();

            if (settings == null)
            {
                // No existing record — add new (Id assigned by Entity base constructor)
                _context.Settings.Add(updatedSettings);
            }
            else
            {
                // Update existing settings (property-by-property to preserve Id)
                settings.CompanyName      = updatedSettings.CompanyName;
                settings.DocumentNumber   = updatedSettings.DocumentNumber;
                settings.Address          = updatedSettings.Address;
                settings.Phone            = updatedSettings.Phone;
                settings.Email            = updatedSettings.Email;
                settings.Website          = updatedSettings.Website;
                settings.LogoBase64       = updatedSettings.LogoBase64;
                settings.Currency         = updatedSettings.Currency;
                settings.CurrencySymbol   = updatedSettings.CurrencySymbol;
                settings.TimeZone         = updatedSettings.TimeZone;
                settings.DateFormat       = updatedSettings.DateFormat;
                settings.TimeFormat       = updatedSettings.TimeFormat;
                settings.Language         = updatedSettings.Language;
                settings.SessionTimeout   = updatedSettings.SessionTimeout;
                settings.TaxRate          = updatedSettings.TaxRate;
                settings.DefaultCheckInTime = updatedSettings.DefaultCheckInTime;
                settings.DefaultCheckOutTime = updatedSettings.DefaultCheckOutTime;
                settings.MaxGuestsPerRoom = updatedSettings.MaxGuestsPerRoom;
                settings.EnableOnlineBookings = updatedSettings.EnableOnlineBookings;
            }

            await _context.SaveChangesAsync();
            return Ok(settings ?? updatedSettings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating settings");
            return StatusCode(500, "Error updating settings");
        }
    }
}
