using GlobeTrek.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<TourPackage> TourPackages => Set<TourPackage>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<TravelPlan> TravelPlans => Set<TravelPlan>();
    public DbSet<CustomerQuery> CustomerQueries => Set<CustomerQuery>();
    public DbSet<Accommodation> Accommodations => Set<Accommodation>();
    public DbSet<Transportation> Transportations => Set<Transportation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .HasMaxLength(191)
            .IsRequired();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Customer" },
            new Role { RoleId = 2, RoleName = "Staff" },
            new Role { RoleId = 3, RoleName = "Admin" }
        );
       
        modelBuilder.Entity<TourPackage>()
    	   .Property(p => p.Price)
           .HasPrecision(10, 2);

        modelBuilder.Entity<Booking>()
    	   .Property(b => b.TotalAmount)
    	   .HasPrecision(10, 2);

	modelBuilder.Entity<Booking>()
    	   .HasOne(b => b.User)
    	   .WithMany()
    	   .HasForeignKey(b => b.UserId);

	modelBuilder.Entity<Booking>()
    	   .HasOne(b => b.TourPackage)
    	   .WithMany()
    	   .HasForeignKey(b => b.TourPackageId);

	modelBuilder.Entity<Payment>()
          .Property(p => p.Amount)
    	  .HasPrecision(10, 2);

	modelBuilder.Entity<Payment>()
    	  .HasOne(p => p.Booking)
    	  .WithOne()
    	  .HasForeignKey<Payment>(p => p.BookingId);

	modelBuilder.Entity<TravelPlan>()
    	  .HasOne(t => t.Booking)
    	  .WithOne()
    	  .HasForeignKey<TravelPlan>(t => t.BookingId);

	modelBuilder.Entity<TravelPlan>()
    	  .HasIndex(t => t.BookingId)
    	  .IsUnique();

	modelBuilder.Entity<CustomerQuery>()
    	  .HasOne(q => q.User)
    	  .WithMany()
    	  .HasForeignKey(q => q.UserId);

	modelBuilder.Entity<Accommodation>()
    	  .Property(a => a.PricePerNight)
    	  .HasPrecision(10, 2);

	modelBuilder.Entity<Transportation>()
    	  .Property(t => t.Price)
    	  .HasPrecision(10, 2);
    }
}