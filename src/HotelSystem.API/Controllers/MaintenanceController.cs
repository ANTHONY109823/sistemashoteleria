using HotelSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace HotelSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class MaintenanceController : ControllerBase
{
    private readonly HotelDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MaintenanceController> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly string _backupFolder;

    public MaintenanceController(HotelDbContext context, IConfiguration configuration, ILogger<MaintenanceController> logger, IWebHostEnvironment environment)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _environment = environment;
        
        // Define backup folder inside the project root directory
        _backupFolder = Path.Combine(_environment.ContentRootPath, "Backups");
        if (!Directory.Exists(_backupFolder))
        {
            Directory.CreateDirectory(_backupFolder);
        }
    }

    [HttpGet("backups")]
    public IActionResult GetBackups()
    {
        try
        {
            var files = Directory.GetFiles(_backupFolder, "*.bak")
                .Select(f => new FileInfo(f))
                .OrderByDescending(f => f.CreationTime)
                .Select(f => new
                {
                    fileName = f.Name,
                    sizeMB = Math.Round(f.Length / 1024.0 / 1024.0, 2),
                    createdAt = f.CreationTime
                });

            return Ok(files);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting backups");
            return StatusCode(500, "Error obtaining backup list. " + ex.Message);
        }
    }

    [HttpPost("backup")]
    public async Task<IActionResult> Backup()
    {
        try
        {
            var connection = _context.Database.GetDbConnection();
            string dbName = connection.Database;
            string fileName = $"Backup_{dbName}_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
            string backupPath = Path.Combine(_backupFolder, fileName);

            string sql = $"BACKUP DATABASE [{dbName}] TO DISK = '{backupPath}' WITH INIT, NAME = 'Full Backup of {dbName}', STATS = 10";
            
            await _context.Database.ExecuteSqlRawAsync(sql);

            return Ok(new { Message = "Backup created successfully", FileName = fileName });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating backup");
            return StatusCode(500, "Error generating backup (Check SQL Server permissions writing to Backups folder): " + ex.Message);
        }
    }

    [HttpPost("restore/{fileName}")]
    public async Task<IActionResult> Restore(string fileName)
    {
        try
        {
            // Security check
            if (fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
            {
                return BadRequest("Invalid filename");
            }

            string backupPath = Path.Combine(_backupFolder, fileName);
            if (!System.IO.File.Exists(backupPath))
            {
                return NotFound("Backup file not found");
            }

            var currentConnection = _context.Database.GetDbConnection();
            string dbName = currentConnection.Database;
            string connectionString = _configuration.GetConnectionString("DefaultConnection") ?? "";
            
            // Rewrite connection string to connect to master database to drop existing connections
            var builder = new SqlConnectionStringBuilder(connectionString)
            {
                InitialCatalog = "master"
            };

            var masterConnString = builder.ConnectionString;

            using (var connection = new SqlConnection(masterConnString))
            {
                await connection.OpenAsync();

                // 1. Kick out other users
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = $"ALTER DATABASE [{dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;";
                    await command.ExecuteNonQueryAsync();
                }

                // 2. Restore database
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = $"RESTORE DATABASE [{dbName}] FROM DISK = '{backupPath}' WITH REPLACE;";
                    command.CommandTimeout = 0; // Backup restores can take long
                    await command.ExecuteNonQueryAsync();
                }

                // 3. Set multi-user mode back
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = $"ALTER DATABASE [{dbName}] SET MULTI_USER;";
                    await command.ExecuteNonQueryAsync();
                }
            }

            return Ok(new { Message = "Database restored successfully. System will reload." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring backup");
            // Attempt to recover MULTI_USER mode if failed midway
            try
            {
                var connection = _context.Database.GetDbConnection();
                string dbName = connection.Database;
                string masterConnString = new SqlConnectionStringBuilder(_configuration.GetConnectionString("DefaultConnection")) { InitialCatalog = "master" }.ConnectionString;
                using var conn = new SqlConnection(masterConnString);
                conn.Open();
                using var cmd = conn.CreateCommand();
                cmd.CommandText = $"ALTER DATABASE [{dbName}] SET MULTI_USER;";
                cmd.ExecuteNonQuery();
            }
            catch { /* Best effort */ }

            return StatusCode(500, "Error restoring backup: " + ex.Message);
        }
    }

    [HttpPost("reset")]
    public async Task<IActionResult> ResetSystem()
    {
        try
        {
            // Truncate operational tables and specific config. Users and Settings stay.
            var sqls = new[]
            {
                "EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all'",
                "DELETE FROM InvoiceItems",
                "DELETE FROM Invoices",
                "DELETE FROM HousekeepingTasks",
                "DELETE FROM AuditLogs",
                "DELETE FROM Notifications",
                "DELETE FROM Reservations",
                "DELETE FROM Guests",
                "DELETE FROM Rooms",
                "DELETE FROM RoomTypes",
                "EXEC sp_msforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all'"
            };

            foreach(var sql in sqls)
            {
                try 
                { 
                    await _context.Database.ExecuteSqlRawAsync(sql); 
                } 
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Reset info: " + sql);
                }
            }

            return Ok(new { Message = "System has been reset to zero successfully for a new company." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting system");
            return StatusCode(500, "Error resetting system: " + ex.Message);
        }
    }
}
