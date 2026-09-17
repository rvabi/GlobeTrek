using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GlobeTrek.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixDestinationsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TourPackages_Accommodations_AccommodationId",
                table: "TourPackages");

            migrationBuilder.DropForeignKey(
                name: "FK_TourPackages_Transportations_TransportationId",
                table: "TourPackages");

            migrationBuilder.CreateTable(
                name: "Destinations",
                columns: table => new
                {
                    DestinationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BestTimeToVisit = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Attractions = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TravelTips = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ImageUrl = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Destinations", x => x.DestinationId);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_TourPackages_Accommodations_AccommodationId",
                table: "TourPackages",
                column: "AccommodationId",
                principalTable: "Accommodations",
                principalColumn: "AccommodationId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TourPackages_Transportations_TransportationId",
                table: "TourPackages",
                column: "TransportationId",
                principalTable: "Transportations",
                principalColumn: "TransportationId",
                onDelete: ReferentialAction.SetNull);
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

            migrationBuilder.DropTable(
                name: "Destinations");

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
    }
}
