using HotelSystem.Domain.Common;

namespace HotelSystem.Domain.Entities;

public class Settings : Entity
{
    // Company Information
    public string CompanyName { get; set; } = "Hotel Sistema";
    public string DocumentNumber { get; set; } = "";
    public string Address { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string Website { get; set; } = "";
    public string? LogoBase64 { get; set; } // Base64 encoded image

    // Regional Settings
    public string Currency { get; set; } = "USD";
    public string CurrencySymbol { get; set; } = "$";
    public string TimeZone { get; set; } = "America/Lima";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public string TimeFormat { get; set; } = "24h"; // 12h or 24h

    // System Settings
    public string Language { get; set; } = "es";
    public int SessionTimeout { get; set; } = 30; // minutes
    public string DefaultCheckInTime { get; set; } = "15:00";
    public string DefaultCheckOutTime { get; set; } = "11:00";
    public int MaxGuestsPerRoom { get; set; } = 4;
    public bool EnableOnlineBookings { get; set; } = false;

    // Tax Settings
    public decimal TaxRate { get; set; } = 0.18m; // 18% IGV default
}
