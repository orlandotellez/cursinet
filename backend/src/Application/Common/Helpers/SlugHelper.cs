using System.Text.RegularExpressions;

namespace Cursinet.Application.Common.Helpers;

public static class SlugHelper
{
    public static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant()
            .Replace("ñ", "n")
            .Replace("á", "a").Replace("é", "e")
            .Replace("í", "i").Replace("ó", "o")
            .Replace("ú", "u").Replace("ü", "u");

        slug = Regex.Replace(slug, @"[^a-z0-9\-\s]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-{2,}", "-");
        slug = slug.Trim('-');

        return slug;
    }

    public static async Task<string> GenerateUniqueSlugAsync(string title, Func<string, Task<bool>> slugExistsAsync)
    {
        var slug = GenerateSlug(title);
        var baseSlug = slug;
        var counter = 1;
        while (await slugExistsAsync(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }
        return slug;
    }
}
