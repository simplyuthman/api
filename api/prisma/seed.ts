import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Seed faker with a fixed number for deterministic generation
faker.seed(42);

const CITIES = [
  "Austin",
  "Denver",
  "Seattle",
  "Atlanta",
  "Chicago",
  "Boston",
  "Phoenix",
  "Miami",
  "Dallas",
  "San Francisco",
];

const PROPERTY_TYPES = [
  "Modern Apartment",
  "Luxury Villa",
  "Spacious Townhouse",
  "Cozy Studio",
  "Contemporary Penthouse",
  "Suburban Family Home",
  "Historic Brownstone",
  "Mid-Century Modern Residence",
];

async function main() {
  console.log("Starting database seeding...");

  // Generate 12 agencies
  const numAgencies = 12;

  for (let i = 0; i < numAgencies; i++) {
    // Generate deterministic UUID for agency
    const agencyId = faker.string.uuid();
    const city = CITIES[i % CITIES.length];
    const agencyName = `${faker.company.name()} Real Estate`;

    const agency = await prisma.agency.upsert({
      where: { id: agencyId },
      update: {},
      create: {
        id: agencyId,
        name: agencyName,
        city,
      },
    });

    // 4 to 6 agents per agency
    const numAgents = 5;

    for (let j = 0; j < numAgents; j++) {
      const agentId = faker.string.uuid();
      const agentName = faker.person.fullName();
      const email = faker.internet.email({
        firstName: agentName.split(" ")[0],
        lastName: `${agentName.split(" ")[1] || "Agent"}_${i}_${j}`,
      }).toLowerCase();
      const phone = faker.phone.number();

      const agent = await prisma.agent.upsert({
        where: { id: agentId },
        update: {},
        create: {
          id: agentId,
          name: agentName,
          email,
          phone,
          agencyId: agency.id,
        },
      });

      // 6 listings per agent (12 * 5 * 6 = 360 listings total >= 300 target)
      const numListings = 6;

      for (let k = 0; k < numListings; k++) {
        const listingId = faker.string.uuid();
        const propType =
          PROPERTY_TYPES[(i + j + k) % PROPERTY_TYPES.length];
        const bedrooms = faker.number.int({ min: 1, max: 6 });
        const bathrooms = faker.number.int({ min: 1, max: 4 });
        const squareMeters = faker.number.int({ min: 45, max: 450 });
        // Price in cents ($250,000 to $3,500,000)
        const priceMinor = faker.number.int({
          min: 25_000_000,
          max: 350_000_000,
        });

        await prisma.listing.upsert({
          where: { id: listingId },
          update: {},
          create: {
            id: listingId,
            title: `${propType} in ${city}`,
            description: faker.lorem.paragraphs(2),
            city,
            address: faker.location.streetAddress(),
            priceMinor,
            currency: "USD",
            bedrooms,
            bathrooms,
            squareMeters,
            agentId: agent.id,
            listedAt: faker.date.recent({ days: 90 }),
          },
        });
      }
    }
  }

  const agencyCount = await prisma.agency.count();
  const agentCount = await prisma.agent.count();
  const listingCount = await prisma.listing.count();

  console.log(`Seeding complete:`);
  console.log(`- Agencies: ${agencyCount}`);
  console.log(`- Agents: ${agentCount}`);
  console.log(`- Listings: ${listingCount}`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
