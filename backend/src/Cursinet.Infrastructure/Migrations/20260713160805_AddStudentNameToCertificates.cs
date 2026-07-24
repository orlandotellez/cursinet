using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cursinet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentNameToCertificates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "student_name",
                table: "Certificates",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "student_name",
                table: "Certificates");
        }
    }
}
