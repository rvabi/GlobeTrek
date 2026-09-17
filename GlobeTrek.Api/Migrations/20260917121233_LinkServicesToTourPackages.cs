using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GlobeTrek.Api.Migrations
{
    /// <inheritdoc />
    public partial class LinkServicesToTourPackages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccommodationId",
                table: "TourPackages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TransportationId",
                table: "TourPackages",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TourPackages_AccommodationId",
                table: "TourPackages",
                column: "AccommodationId");

            migrationBuilder.CreateIndex(
                name: "IX_TourPackages_TransportationId",
                table: "TourPackages",
                column: "TransportationId");

            migrationBuilder.AddForeignKey(
                name: "FK_TourPackages_Accommodations_AccommodationId",
                table: "TourPackages",
                column: "AccommodationId",
                principalTable: "Accommodations",
                principalColumn: "AccommodationId");

            migrationBuilder.AddForeignKey(
                name: "FK_TourPackages_Transportations_TransportationId",
                table: "TourPackages",
                column: "TransportationId",
                principalTable: "Transportations",
                principalColumn: "TransportationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TourPackages_Accommodations_AccommodationId",
                table: "TourPackages");

            migrationBuilder.DropForeignKey(
                name: "FK_TourPackages_Transportations_TransportationId",
                table: "TourPackages");

            migrationBuilder.DropIndex(
                name: "IX_TourPackages_AccommodationId",
                table: "TourPackages");

            migrationBuilder.DropIndex(
                name: "IX_TourPackages_TransportationId",
                table: "TourPackages");

            migrationBuilder.DropColumn(
                name: "AccommodationId",
                table: "TourPackages");

            migrationBuilder.DropColumn(
                name: "TransportationId",
                table: "TourPackages");
        }
    }
}
