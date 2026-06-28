using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveToGuests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Guests",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Guests");
        }
    }
}
