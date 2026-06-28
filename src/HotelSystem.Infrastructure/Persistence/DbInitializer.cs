using HotelSystem.Domain.Entities;
using HotelSystem.Infrastructure.Identity;
using HotelSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HotelSystem.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<HotelDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<HotelDbContext>>();

            try
            {
                // Apply migrations
                if (context.Database.IsSqlServer())
                {
                    await context.Database.MigrateAsync();
                }

                // Seed Roles
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
                string[] roleNames = { "Admin", "Staff", "User" };
                
                foreach (var roleName in roleNames)
                {
                    if (!await roleManager.RoleExistsAsync(roleName))
                    {
                        await roleManager.CreateAsync(new IdentityRole(roleName));
                    }
                }

                // Seed Default User
                var adminUser = await userManager.FindByEmailAsync("admin@hotel.com");
                if (adminUser == null)
                {
                    logger.LogInformation("Seeding Default Admin User...");
                    adminUser = new ApplicationUser
                    {
                        UserName = "admin@hotel.com",
                        Email = "admin@hotel.com",
                        EmailConfirmed = true,
                        FirstName = "Admin",
                        LastName = "User"
                    };

                    var result = await userManager.CreateAsync(adminUser, "Pa$$w0rd!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                    }
                    else
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        logger.LogError($"Failed to create admin user: {errors}");
                    }
                }
                else
                {
                    // Ensure existing admin has Admin role
                    if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                    }

                }

                // Seed RoomTypes
                if (!await context.RoomTypes.AnyAsync())
                {
                    logger.LogInformation("Seeding Room Types...");
                    var roomTypes = new List<RoomType>
                    {
                        new RoomType { Name = "Standard", Description = "Standard Room", BasePrice = 100, Capacity = 2 },
                        new RoomType { Name = "Deluxe", Description = "Deluxe Room with View", BasePrice = 150, Capacity = 2 },
                        new RoomType { Name = "Suite", Description = "Luxury Suite", BasePrice = 300, Capacity = 4 }
                    };
                    
                    await context.RoomTypes.AddRangeAsync(roomTypes);
                    await context.SaveChangesAsync();
                }

                // Seed Rooms
                if (!await context.Rooms.AnyAsync())
                {
                     logger.LogInformation("Seeding Rooms...");
                     var standardId = (await context.RoomTypes.FirstAsync(rt => rt.Name == "Standard")).Id;
                     var deluxeId = (await context.RoomTypes.FirstAsync(rt => rt.Name == "Deluxe")).Id;
                     
                     var rooms = new List<Room>
                     {
                         new Room { Number = "101", RoomTypeId = standardId, Floor = 1 },
                         new Room { Number = "102", RoomTypeId = standardId, Floor = 1 },
                         new Room { Number = "201", RoomTypeId = deluxeId, Floor = 2 }
                     };
                     
                     await context.Rooms.AddRangeAsync(rooms);
                     await context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while populating the database.");
                throw;
            }
        }
    }
}
