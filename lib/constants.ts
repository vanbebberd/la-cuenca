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
  { name: "Spa & Wellness", slug: "wellness", icon: "Heart", color: "#14b8a6" },
  { name: "Servicios", slug: "servicios", icon: "Wrench", color: "#6b7280" },
  { name: "Panoramas", slug: "panoramas", icon: "Camera", color: "#06b6d4" },
  { name: "Tours", slug: "tours", icon: "Compass", color: "#0ea5e9" },
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

export const RENTAL_AMENITIES = [
  { id: "wifi",           label: "WiFi",               emoji: "📶", group: "Básico" },
  { id: "cocina",         label: "Cocina equipada",     emoji: "🍳", group: "Básico" },
  { id: "lavadora",       label: "Lavadora",            emoji: "🫧", group: "Básico" },
  { id: "tv",             label: "TV",                  emoji: "📺", group: "Básico" },
  { id: "calefaccion",    label: "Calefacción",         emoji: "🔥", group: "Básico" },
  { id: "ac",             label: "Aire acondicionado",  emoji: "❄️", group: "Básico" },
  { id: "estacionamiento",label: "Estacionamiento",     emoji: "🅿️", group: "Básico" },
  { id: "vista-lago",     label: "Vista al lago",       emoji: "🏔️", group: "Vistas" },
  { id: "vista-volcan",   label: "Vista al volcán",     emoji: "🌋", group: "Vistas" },
  { id: "vista-jardin",   label: "Jardín",              emoji: "🌿", group: "Vistas" },
  { id: "terraza",        label: "Terraza",             emoji: "🌅", group: "Vistas" },
  { id: "piscina",        label: "Piscina",             emoji: "🏊", group: "Extras" },
  { id: "jacuzzi",        label: "Jacuzzi / Tina",      emoji: "🛁", group: "Extras" },
  { id: "parrilla",       label: "Parrilla / BBQ",      emoji: "🔥", group: "Extras" },
  { id: "bote",           label: "Acceso con bote",     emoji: "🚤", group: "Extras" },
  { id: "pet-friendly",   label: "Pet friendly",        emoji: "🐾", group: "Reglas" },
  { id: "no-fumar",       label: "No fumar",            emoji: "🚭", group: "Reglas" },
  { id: "detector-humo",  label: "Detector de humo",    emoji: "🚨", group: "Seguridad" },
  { id: "extintor",       label: "Extintor",            emoji: "🧯", group: "Seguridad" },
  { id: "botiquin",       label: "Botiquín",            emoji: "🩺", group: "Seguridad" },
] as const;

export const ACTIVITY_CATEGORIES = [
  { id: "tour",       label: "Tour guiado",          emoji: "🧭" },
  { id: "hike",       label: "Caminata / Trekking",  emoji: "🥾" },
  { id: "bike",       label: "Paseo en bicicleta",   emoji: "🚴" },
  { id: "kayak",      label: "Kayak / Canotaje",     emoji: "🛶" },
  { id: "horseback",  label: "Cabalgata",             emoji: "🐴" },
  { id: "fishing",    label: "Pesca deportiva",       emoji: "🎣" },
  { id: "climbing",   label: "Escalada",              emoji: "🧗" },
  { id: "paragliding",label: "Parapente",             emoji: "🪂" },
  { id: "rafting",    label: "Rafting",               emoji: "🌊" },
  { id: "other",      label: "Otro",                  emoji: "🌿" },
] as const;

export const ACTIVITY_INCLUDES = [
  "Guía especializado",
  "Equipo / Material incluido",
  "Snack / Refrigerio",
  "Almuerzo",
  "Transporte incluido",
  "Seguro de accidentes",
  "Fotos del tour",
  "Chaleco salvavidas",
] as const;

export const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  EASY:        { label: "Fácil",          color: "emerald" },
  MODERATE:    { label: "Moderado",       color: "amber" },
  CHALLENGING: { label: "Desafiante",     color: "orange" },
  EXPERT:      { label: "Experto",        color: "red" },
};

export const AMENITIES = [
  { id: "wifi",           label: "WiFi",                  emoji: "📶", group: "Comodidades" },
  { id: "ac",             label: "Aire acondicionado",     emoji: "❄️", group: "Comodidades" },
  { id: "calefaccion",    label: "Calefacción",            emoji: "🔥", group: "Comodidades" },
  { id: "tv",             label: "TV",                     emoji: "📺", group: "Comodidades" },
  { id: "tarjetas",       label: "Acepta tarjetas",        emoji: "💳", group: "Servicios" },
  { id: "estacionamiento",label: "Estacionamiento",        emoji: "🅿️", group: "Servicios" },
  { id: "para-llevar",    label: "Para llevar",            emoji: "🥡", group: "Servicios" },
  { id: "delivery",       label: "Delivery",               emoji: "🛵", group: "Servicios" },
  { id: "reservas",       label: "Acepta reservas",        emoji: "📅", group: "Servicios" },
  { id: "pet-friendly",   label: "Pet friendly",           emoji: "🐾", group: "Ambiente" },
  { id: "kids-friendly",  label: "Apto para niños",        emoji: "👶", group: "Ambiente" },
  { id: "terraza",        label: "Terraza / Exterior",     emoji: "🌿", group: "Ambiente" },
  { id: "vista-lago",     label: "Vista al lago",          emoji: "🏔️", group: "Ambiente" },
  { id: "musica",         label: "Música en vivo",         emoji: "🎵", group: "Ambiente" },
  { id: "accesible",      label: "Acceso silla de ruedas", emoji: "♿", group: "Accesibilidad" },
  { id: "vegano",         label: "Opciones veganas",       emoji: "🌱", group: "Comida" },
  { id: "gluten-free",    label: "Sin gluten",             emoji: "🌾", group: "Comida" },
  { id: "piscina",        label: "Piscina",                emoji: "🏊", group: "Comodidades" },
  { id: "caminable",      label: "Distancia caminable",    emoji: "🚶", group: "Ambiente" },
] as const;
