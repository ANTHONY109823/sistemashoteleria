using HotelSystem.Application;
using HotelSystem.Infrastructure;
using HotelSystem.Infrastructure.Persistence;
using HotelSystem.Infrastructure.Jobs;
using Hangfire;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"[DEBUG] Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"[DEBUG] ContentRoot Path: {builder.Environment.ContentRootPath}");
Console.WriteLine($"[DEBUG] Connection String: {connectionString}");

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddSignalR();

var app = builder.Build();

// Seed Database in Development
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            await HotelSystem.Infrastructure.Persistence.DbInitializer.SeedAsync(scope.ServiceProvider);
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}

// app.UseHttpsRedirection();

app.UseCors(builder =>
{
    builder.WithOrigins("http://localhost:5173")
           .AllowAnyMethod()
           .AllowAnyHeader()
           .AllowCredentials();
});

app.UseAuthentication();
app.UseAuthorization();

// Hangfire Dashboard (accessible at /hangfire)
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new Hangfire.Dashboard.LocalRequestsOnlyAuthorizationFilter() }
});

// Register recurring Night Audit job (runs daily at 23:55 UTC)
RecurringJob.AddOrUpdate<NightAuditJob>(
    "night-audit",
    job => job.RunAsync(),
    "55 23 * * *",
    new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc });

app.MapControllers();
app.MapHangfireDashboard();
app.MapHub<HotelSystem.API.Hubs.NotificationHub>("/hubs/notifications");

app.Run();
