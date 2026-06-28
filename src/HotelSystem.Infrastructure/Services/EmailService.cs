using HotelSystem.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace HotelSystem.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendReservationConfirmationAsync(
        string guestEmail,
        string guestName,
        string reservationId,
        DateTime checkInDate,
        DateTime checkOutDate,
        string roomNumber,
        string roomType,
        decimal totalPrice)
    {
        var subject = $"Confirmación de Reserva - #{reservationId}";
        var htmlBody = GetReservationConfirmationTemplate(
            guestName, reservationId, checkInDate, checkOutDate,
            roomNumber, roomType, totalPrice);

        await SendEmailAsync(guestEmail, subject, htmlBody);
    }

    public async Task SendCheckInReminderAsync(
        string guestEmail,
        string guestName,
        DateTime checkInDate,
        string roomNumber)
    {
        var subject = $"Recordatorio: Check-in Mañana - Habitación {roomNumber}";
        var htmlBody = GetCheckInReminderTemplate(guestName, checkInDate, roomNumber);

        await SendEmailAsync(guestEmail, subject, htmlBody);
    }

    public async Task SendCheckOutReminderAsync(
        string guestEmail,
        string guestName,
        DateTime checkOutDate,
        string roomNumber)
    {
        var subject = $"Recordatorio: Check-out Hoy - Habitación {roomNumber}";
        var htmlBody = GetCheckOutReminderTemplate(guestName, checkOutDate, roomNumber);

        await SendEmailAsync(guestEmail, subject, htmlBody);
    }

    public async Task SendAdminAlertAsync(string subject, string message)
    {
        var adminEmail = _configuration["EmailSettings:AdminEmail"] ?? "admin@hotel.com";
        var htmlBody = GetAdminAlertTemplate(subject, message);

        await SendEmailAsync(adminEmail, $"[ALERTA] {subject}", htmlBody);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpServer = emailSettings["SmtpServer"];
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
            var smtpUsername = emailSettings["SmtpUsername"];
            var smtpPassword = emailSettings["SmtpPassword"];
            var fromEmail = emailSettings["FromEmail"];
            var fromName = emailSettings["FromName"] ?? "Hotel Management System";
            var enableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true");

            if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(smtpUsername))
            {
                _logger.LogWarning("Email settings not configured. Skipping email send.");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpServer, smtpPort, enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);
            
            if (!string.IsNullOrEmpty(smtpUsername) && !string.IsNullOrEmpty(smtpPassword))
            {
                await client.AuthenticateAsync(smtpUsername, smtpPassword);
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation($"Email sent successfully to {toEmail}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending email to {toEmail}");
            // Don't throw - email failures shouldn't break the application
        }
    }

    private string GetReservationConfirmationTemplate(
        string guestName,
        string reservationId,
        DateTime checkInDate,
        DateTime checkOutDate,
        string roomNumber,
        string roomType,
        decimal totalPrice)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .reservation-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .detail-row {{ display: flex; padding: 12px 0; border-bottom: 1px solid #eee; }}
        .detail-label {{ font-weight: bold; width: 150px; color: #667eea; }}
        .detail-value {{ flex: 1; }}
        .total {{ font-size: 24px; font-weight: bold; color: #667eea; text-align: right; margin-top: 15px; }}
        .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }}
        .btn {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏨 Confirmación de Reserva</h1>
            <p>¡Gracias por elegir nuestro hotel!</p>
        </div>
        <div class='content'>
            <h2>Hola {guestName},</h2>
            <p>Nos complace confirmar su reserva. A continuación los detalles:</p>
            
            <div class='reservation-details'>
                <div class='detail-row'>
                    <span class='detail-label'>Número de Reserva:</span>
                    <span class='detail-value'><strong>#{reservationId}</strong></span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Check-in:</span>
                    <span class='detail-value'>{checkInDate:dddd, dd MMMM yyyy}</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Check-out:</span>
                    <span class='detail-value'>{checkOutDate:dddd, dd MMMM yyyy}</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Habitación:</span>
                    <span class='detail-value'>#{roomNumber}</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Tipo de Habitación:</span>
                    <span class='detail-value'>{roomType}</span>
                </div>
                <div class='total'>
                    Total: ${totalPrice:F2}
                </div>
            </div>

            <p><strong>Información importante:</strong></p>
            <ul>
                <li>El check-in es a partir de las 3:00 PM</li>
                <li>El check-out debe realizarse antes de las 12:00 PM</li>
                <li>Por favor traiga un documento de identidad válido</li>
            </ul>

            <p>Si tiene alguna pregunta o necesita hacer cambios, no dude en contactarnos.</p>

            <center>
                <a href='#' class='btn'>Ver Mi Reserva</a>
            </center>
        </div>
        <div class='footer'>
            <p>Hotel Management System<br>
            📧 info@hotel.com | 📞 +1 (555) 123-4567</p>
            <p style='font-size: 10px; color: #aaa;'>Este es un correo automático, por favor no responda.</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GetCheckInReminderTemplate(string guestName, DateTime checkInDate, string roomNumber)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .highlight {{ background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⏰ Recordatorio de Check-in</h1>
        </div>
        <div class='content'>
            <h2>Hola {guestName},</h2>
            <p>¡Su estadía comienza mañana! Estamos emocionados de recibirle.</p>
            
            <div class='highlight'>
                <p><strong>📅 Check-in:</strong> {checkInDate:dddd, dd MMMM yyyy}</p>
                <p><strong>🚪 Habitación:</strong> #{roomNumber}</p>
                <p><strong>🕒 Horario:</strong> A partir de las 3:00 PM</p>
            </div>

            <p><strong>No olvide traer:</strong></p>
            <ul>
                <li>Documento de identidad válido</li>
                <li>Confirmación de reserva</li>
                <li>Tarjeta de crédito/débito</li>
            </ul>

            <p>¡Nos vemos mañana!</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GetCheckOutReminderTemplate(string guestName, DateTime checkOutDate, string roomNumber)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #764ba2; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>👋 Recordatorio de Check-out</h1>
        </div>
        <div class='content'>
            <h2>Hola {guestName},</h2>
            <p>Esperamos que haya disfrutado su estadía con nosotros.</p>
            <p><strong>🚪 Check-out hoy:</strong> Habitación #{roomNumber}</p>
            <p><strong>🕛 Antes de las:</strong> 12:00 PM</p>
            <p>Por favor deje su llave en recepción. ¡Esperamos verle pronto!</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GetAdminAlertTemplate(string title, string message)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #dc3545; color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 30px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⚠️ {title}</h1>
        </div>
        <div class='content'>
            <p>{message}</p>
            <p><small>Enviado automáticamente por Hotel Management System</small></p>
        </div>
    </div>
</body>
</html>";
    }
}
