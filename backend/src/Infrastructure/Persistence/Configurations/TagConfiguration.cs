using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        // Nombre que le daremos a la tabla
        builder.ToTable("Tags");

        // Configuraciones de los campos de la tabla Tags
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        builder.Property(t => t.Name).IsRequired().HasColumnName("name").HasMaxLength(100);

        builder.Property(t => t.Slug).IsRequired().HasColumnName("slug").HasMaxLength(100);
        builder.HasIndex(t => t.Slug).IsUnique();

        builder.Property(t => t.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(t => t.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
