import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CITIES, CATEGORIES } from "../lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

const BUSINESSES = [
  // Puerto Varas
  {
    name: "Café Mawen",
    slug: "cafe-mawen",
    shortDesc: "El mejor café con vista al lago y al volcán Osorno",
    description: "Un acogedor café en el corazón de Puerto Varas con una vista privilegiada al lago Llanquihue y el volcán Osorno. Ofrecemos desayunos artesanales, brunch y almuerzos con ingredientes locales.",
    coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    citySlug: "puerto-varas", categorySlug: "cafes", priceRange: "MODERATE",
    address: "Del Salvador 441, Puerto Varas", phone: "+56 65 223 3456",
    whatsapp: "+56965223456", instagram: "@cafemawen",
    lat: -41.3224, lng: -72.9835, pointsEnabled: true, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  {
    name: "Club de Yates Puerto Varas",
    slug: "club-de-yates-puerto-varas",
    shortDesc: "Restaurante de mariscos y pescados frescos frente al lago",
    description: "Ubicado a orillas del lago Llanquihue, el Club de Yates es el lugar ideal para disfrutar de los mejores mariscos y pescados de la zona. Vista panorámica al volcán Osorno.",
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    citySlug: "puerto-varas", categorySlug: "restaurantes", priceRange: "EXPENSIVE",
    address: "Costanera s/n, Puerto Varas", phone: "+56 65 223 3990",
    whatsapp: "+56965233990", instagram: "@clubdeyatespv",
    lat: -41.3246, lng: -72.9918, pointsEnabled: true, pointsPerPeso: 0.015, status: "ACTIVE",
  },
  {
    name: "Cervecería Puerto Varas",
    slug: "cerveceria-puerto-varas",
    shortDesc: "Cerveza artesanal elaborada con agua del lago Llanquihue",
    description: "Somos una cervecería artesanal que utiliza el agua pura del lago Llanquihue en nuestras recetas. Más de 12 variedades de cerveza en grifo, tablas de picoteo y maridajes especiales.",
    coverImage: "https://images.unsplash.com/photo-1559818755-1e07a81cd9e6?w=800&q=80",
    citySlug: "puerto-varas", categorySlug: "cervecerias", priceRange: "MODERATE",
    address: "Walker Martínez 584, Puerto Varas", phone: "+56 65 223 4567",
    whatsapp: "+56965234567", instagram: "@cerveceriapv",
    lat: -41.3198, lng: -72.9823, pointsEnabled: true, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  {
    name: "Hotel Puelche",
    slug: "hotel-puelche",
    shortDesc: "Hotel boutique con vista al lago y al volcán Osorno",
    description: "Hotel boutique de categoría superior ubicado frente al lago Llanquihue. Habitaciones con vista al volcán Osorno, piscina temperada, spa y restaurante gourmet. El lugar perfecto para desconectarse.",
    coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    citySlug: "puerto-varas", categorySlug: "hoteles", priceRange: "LUXURY",
    address: "Klenner 351, Puerto Varas", phone: "+56 65 223 6000",
    website: "https://hotelpuelche.cl", instagram: "@hotelpuelche",
    lat: -41.3255, lng: -72.9867, pointsEnabled: false, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  {
    name: "Kayak Lago Llanquihue",
    slug: "kayak-lago-llanquihue",
    shortDesc: "Tours en kayak por el lago con vista al volcán Osorno",
    description: "Aventúrate en el lago Llanquihue en kayak. Ofrecemos tours guiados al amanecer, al atardecer y nocturnos con vista al volcán. Equipos de alta calidad incluidos. No necesitas experiencia previa.",
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    citySlug: "puerto-varas", categorySlug: "actividades", priceRange: "MODERATE",
    address: "Costanera Norte 1280, Puerto Varas", phone: "+56 9 9123 4567",
    whatsapp: "+56991234567", instagram: "@kayakllanquihue",
    lat: -41.3301, lng: -72.9745, pointsEnabled: false, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  {
    name: "Feria Artesanal Puerto Varas",
    slug: "feria-artesanal-puerto-varas",
    shortDesc: "Artesanía local, tejidos y productos típicos de la región",
    description: "La feria artesanal más importante de Puerto Varas. Más de 50 artesanos locales con productos únicos: tejidos mapuches, madera tallada, cerámica, confites y productos gourmet regionales.",
    coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    citySlug: "puerto-varas", categorySlug: "tiendas", priceRange: "BUDGET",
    address: "Plaza de Armas, Puerto Varas", phone: "+56 9 8765 4321",
    lat: -41.3183, lng: -72.9852, pointsEnabled: false, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  // Puerto Montt
  {
    name: "Mercado Angelmó",
    slug: "mercado-angelmo",
    shortDesc: "El mercado de mariscos más famoso del sur de Chile",
    description: "Angelmó es el mercado costero más tradicional de Puerto Montt. Aquí encontrarás los mariscos más frescos del sur de Chile: locos, ostras, choritos, machas y congrio. Experiencia gastronómica única.",
    coverImage: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80",
    citySlug: "puerto-montt", categorySlug: "restaurantes", priceRange: "BUDGET",
    address: "Avenida Angelmó s/n, Puerto Montt", phone: "+56 65 225 4321",
    lat: -41.4850, lng: -72.9670, pointsEnabled: false, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  {
    name: "Hotel Dreams Puerto Montt",
    slug: "hotel-dreams-puerto-montt",
    shortDesc: "Hotel de lujo con casino, spa y vista al seno de Reloncaví",
    description: "El hotel más lujoso de Puerto Montt con ubicación privilegiada frente al seno de Reloncaví. Casino, spa de primer nivel, restaurante gourmet, piscina temperada y 200 habitaciones de lujo.",
    coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    citySlug: "puerto-montt", categorySlug: "hoteles", priceRange: "LUXURY",
    address: "Av. Presidente Ibáñez 195, Puerto Montt", phone: "+56 65 222 9000",
    website: "https://mundodreams.com", instagram: "@dreamspuertomontt",
    lat: -41.4712, lng: -72.9456, pointsEnabled: false, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  // Frutillar
  {
    name: "Cervecería Kühne",
    slug: "cerveceria-kuhne",
    shortDesc: "Cerveza artesanal alemana elaborada con tradición familiar desde 1915",
    description: "La cervecería artesanal más antigua de la región de Los Lagos. Con más de 100 años de tradición alemana, elaboramos cerveza siguiendo recetas originales traídas de Baviera. Visitas guiadas incluidas.",
    coverImage: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&q=80",
    citySlug: "frutillar", categorySlug: "cervecerias", priceRange: "MODERATE",
    address: "Pérez Rosales 68, Frutillar", phone: "+56 65 242 1396",
    instagram: "@cerveceriakuhne",
    lat: -41.1295, lng: -73.0412, pointsEnabled: true, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  {
    name: "Teatro del Lago",
    slug: "teatro-del-lago",
    shortDesc: "Centro cultural de clase mundial a orillas del lago Llanquihue",
    description: "El Teatro del Lago es uno de los recintos culturales más modernos de Latinoamérica. Temporada estable de conciertos, ópera, teatro y danza. Vista incomparable al lago y los volcanes desde su terraza.",
    coverImage: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&q=80",
    citySlug: "frutillar", categorySlug: "panoramas", priceRange: "MODERATE",
    address: "Av. Philippi 1000, Frutillar", phone: "+56 65 242 2900",
    website: "https://teatrodellago.cl", instagram: "@teatrodellago",
    lat: -41.1270, lng: -73.0380, pointsEnabled: false, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  // Llanquihue
  {
    name: "Restaurante El Muelle",
    slug: "restaurante-el-muelle",
    shortDesc: "Cocina chilena tradicional con vista al lago desde el muelle",
    description: "Restaurante familiar ubicado directamente sobre el lago Llanquihue. Especialistas en cocina chilena tradicional con productos del campo y del lago. El atardecer desde nuestra terraza es imperdible.",
    coverImage: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
    citySlug: "llanquihue", categorySlug: "restaurantes", priceRange: "MODERATE",
    address: "Muelle s/n, Llanquihue", phone: "+56 65 224 5678",
    whatsapp: "+56965245678",
    lat: -41.2469, lng: -73.0019, pointsEnabled: true, pointsPerPeso: 0.01, status: "ACTIVE",
  },
  // Puerto Octay
  {
    name: "Hotel Centinela",
    slug: "hotel-centinela",
    shortDesc: "Hotel histórico en la Península de Centinela con vista 360°",
    description: "El hotel más histórico y pintoresco de la región. Construido en 1913 en la Península de Centinela, con vista panorámica de 360° al lago Llanquihue y los volcanes Osorno, Calbuco y Tronador.",
    coverImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    citySlug: "puerto-octay", categorySlug: "hoteles", priceRange: "EXPENSIVE",
    address: "Península de Centinela, Puerto Octay", phone: "+56 65 239 1326",
    website: "https://hotelcentinela.cl",
    lat: -40.9628, lng: -72.9005, pointsEnabled: false, pointsPerPeso: 0.01, status: "ACTIVE",
  },
];

async function main() {
  console.log("Seeding cities...");
  for (const city of CITIES) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: {},
      create: { name: city.name, slug: city.slug, lat: city.lat, lng: city.lng },
    });
  }

  console.log("Seeding categories...");
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, color: cat.color, order: i },
    });
  }

  console.log("Seeding businesses...");
  for (const b of BUSINESSES) {
    const city = await prisma.city.findUnique({ where: { slug: b.citySlug } });
    const category = await prisma.category.findUnique({ where: { slug: b.categorySlug } });
    if (!city || !category) { console.log(`  ⚠ Skip ${b.name}: city/category not found`); continue; }

    const data = {
        name: b.name, slug: b.slug,
        shortDesc: b.shortDesc, description: b.description,
        coverImage: b.coverImage ?? null,
        cityId: city.id, categoryId: category.id,
        priceRange: b.priceRange as never,
        address: b.address,
        phone: b.phone ?? null,
        whatsapp: b.whatsapp ?? null,
        website: b.website ?? null,
        instagram: b.instagram ?? null,
        lat: b.lat, lng: b.lng,
        pointsEnabled: b.pointsEnabled, pointsPerPeso: b.pointsPerPeso,
        status: b.status as never,
      };
    await prisma.business.upsert({
      where: { slug: b.slug },
      update: { coverImage: b.coverImage ?? null },
      create: data,
    });
    console.log(`  ✓ ${b.name}`);
  }

  console.log("\nSeed complete ✓");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
