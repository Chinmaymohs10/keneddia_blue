export const createHotelSlug = (city: string, id: number) => {
  if (!city) return id.toString();

  return `${city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${id}`;
};
export const createCitySlug = (city?: string) =>
  city
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "hotel";