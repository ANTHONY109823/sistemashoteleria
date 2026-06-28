namespace HotelSystem.Application.Interfaces;

/// <summary>
/// Service for sending email notifications
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends a reservation confirmation email to the guest
    /// </summary>
    Task SendReservationConfirmationAsync(
        string guestEmail,
        string guestName,
        string reservationId,
        DateTime checkInDate,
        DateTime checkOutDate,
        string roomNumber,
        string roomType,
        decimal totalPrice);

    /// <summary>
    /// Sends a check-in reminder email 24 hours before check-in
    /// </summary>
    Task SendCheckInReminderAsync(
        string guestEmail,
        string guestName,
        DateTime checkInDate,
        string roomNumber);

    /// <summary>
    /// Sends a check-out reminder email on check-out day
    /// </summary>
    Task SendCheckOutReminderAsync(
        string guestEmail,
        string guestName,
        DateTime checkOutDate,
        string roomNumber);

    /// <summary>
    /// Sends an alert email to administrators
    /// </summary>
    Task SendAdminAlertAsync(
        string subject,
        string message);
}
