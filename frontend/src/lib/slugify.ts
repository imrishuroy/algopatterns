// Utility function to convert a string to a URL-friendly slug
// e.g., "Minimum Arrows to Burst Balloons" -> "minimum-arrows-to-burst-balloons"
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

// Find section index by slug in a list of sections with titles
export const findSectionIndexBySlug = (
  sections: { title: string }[],
  slug: string
): number => {
  const normalizedSlug = slug.toLowerCase();
  return sections.findIndex(
    (section) => slugify(section.title) === normalizedSlug
  );
};
