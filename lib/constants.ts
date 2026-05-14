export const CITIES = [
  { name: "Puerto Montt", slug: "puerto-montt", lat: -41.4693, lng: -72.9424 },
  { name: "Puerto Varas", slug: "puerto-varas", lat: -41.3167, lng: -72.9833 },
  { name: "Llanquihue", slug: "llanquihue", lat: -41.2469, lng: -73.0019 },
  { name: "Frutillar", slug: "frutillar", lat: -41.1269, lng: -73.0386 },
  { name: "Puerto Octay", slug: "puerto-octay", lat: -40.9628, lng: -72.9005 },
  { name: "Cochamó", slug: "cochamo", lat: -41.4894, lng: -72.3167 },
] as const;

export const CATEGORIES = [
  { name: "Restaurantes", slug: "restaurantes", icon: "UtensilsCrossed", color: "#ef4444" },
  { name: "Cafés", slug: "cafes", icon: "Coffee", color: "#92400e" },
  { name: "Hoteles", slug: "hoteles", icon: "BedDouble", color: "#3b82f6" },
  { name: "Bares", slug: "bares", icon: "Beer", color: "#f59e0b" },
  { name: "Turismo", slug: "turismo", icon: "Map", color: "#10b981" },
  { name: "Actividades", slug: "actividades", icon: "Activity", color: "#8b5cf6" },
  { name: "Tiendas", slug: "tiendas", icon: "ShoppingBag", color: "#ec4899" },
  { name: "Delivery", slug: "delivery", icon: "Bike", color: "#f97316" },
  { name: "Cervecerías", slug: "cervecerias", icon: "GlassWater", color: "#d97706" },
  { name: "Wellness", slug: "wellness", icon: "Heart", color: "#14b8a6" },
  { name: "Servicios", slug: "servicios", icon: "Wrench", color: "#6b7280" },
  { name: "Panoramas", slug: "panoramas", icon: "Camera", color: "#06b6d4" },
] as const;

export const PRICE_RANGES = [
  { value: "BUDGET", label: "$", description: "Económico" },
  { value: "MODERATE", label: "$$", description: "Moderado" },
  { value: "EXPENSIVE", label: "$$$", description: "Caro" },
  { value: "LUXURY", label: "$$$$", description: "Lujo" },
] as const;

export const LEVEL_CONFIG = {
  bronze: { label: "Bronze", color: "#cd7f32", min: 0 },
  silver: { label: "Silver", color: "#c0c0c0", min: 1000 },
  gold: { label: "Gold", color: "#ffd700", min: 5000 },
  diamond: { label: "Diamond", color: "#b9f2ff", min: 10000 },
} as const;

export const POINTS_PER_1000 = 10;
