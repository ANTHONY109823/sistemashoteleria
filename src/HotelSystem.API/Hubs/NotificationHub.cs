using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace HotelSystem.API.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendNotification(string title, string message, string type)
        {
            await Clients.All.SendAsync("ReceiveNotification", new { Title = title, Message = message, Type = type });
        }
    }
}
