import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

/**
 * Fixed list of US metro areas used for all city fields.
 * This makes city filtering produce meaningfully different result sets (PRD §6).
 */
const CITIES = [
  'Austin',
  'Denver',
  'Seattle',
  'Atlanta',
  'Chicago',
  'Boston',
  'Phoenix',
  'Miami',
  'Dallas',
  'San Francisco',
];

/**
 * Seeded faker instance: provides deterministic fake data when seeded with a
 * fixed value. We re-seed per entity using a stable index so that re-running
 * the script always produces the same Faker output for the same record.
 */

/** Build a deterministic UUID from a namespace prefix and an index. */
function stableId(prefix: string, index: number): string {
  // Use faker's UUID generation seeded with a predictable value.
  faker.seed(parseInt(prefix.charCodeAt(0).toString() + index.toString(), 10));
  return faker.string.uuid();
}

async function main() {
  console.log('🌱 Seeding database…');

  // ---------------------------------------------------------------------------
  // Agencies  (10–20 total)
  // ---------------------------------------------------------------------------
  const AGENCY_COUNT = 15;

  for (let a = 0; a < AGENCY_COUNT; a++) {
    const agencyId = stableId('A', a);
    const city = CITIES[a % CITIES.length];

    faker.seed(1000 + a);
    const agency = await prisma.agency.upsert({
      where: { id: agencyId },
      update: {},
      create: {
        id: agencyId,
        name: `${faker.company.name()} Realty`,
        city,
      },
    });

    // -------------------------------------------------------------------------
    // Agents  (3–8 per agency)
    // -------------------------------------------------------------------------
    const agentCount = 3 + (a % 6); // cycles 3..8

    for (let ag = 0; ag < agentCount; ag++) {
      const agentId = stableId('G', a * 10 + ag);
      faker.seed(2000 + a * 10 + ag);

      const agent = await prisma.agent.upsert({
        where: { id: agentId },
        update: {},
        create: {
          id: agentId,
          name: faker.person.fullName(),
          email: faker.internet.email({ provider: 'example.com' }),
          phone: faker.phone.number({ style: 'national' }),
          agencyId: agency.id,
        },
      });

      // -----------------------------------------------------------------------
      // Listings  (15–40 per agent)
      // -----------------------------------------------------------------------
      const listingCount = 15 + (ag % 26); // cycles 15..40

      for (let l = 0; l < listingCount; l++) {
        const listingId = stableId('L', a * 100 + ag * 10 + l);
        faker.seed(3000 + a * 100 + ag * 10 + l);

        const listingCity = CITIES[(a + ag + l) % CITIES.length];
        // Store price in cents (minor units). Range: $100k – $2M → 10_000_000 – 200_000_000 cents.
        const priceMinor = faker.number.int({ min: 10_000_000, max: 200_000_000 });

        await prisma.listing.upsert({
          where: { id: listingId },
          update: {},
          create: {
            id: listingId,
            title: `${faker.number.int({ min: 1, max: 5 })} bed home in ${listingCity}`,
            description: faker.lorem.paragraph(),
            city: listingCity,
            address: faker.location.streetAddress(),
            priceMinor,
            currency: 'USD',
            bedrooms: faker.number.int({ min: 1, max: 6 }),
            bathrooms: faker.number.int({ min: 1, max: 4 }),
            squareMeters: faker.number.int({ min: 50, max: 600 }),
            agentId: agent.id,
            listedAt: faker.date.past({ years: 2 }),
          },
        });
      }
    }

    console.log(`  ✓ Agency "${agency.name}" + agents + listings`);
  }

  // Summary
  const [agencyCount, agentCount, listingCount] = await Promise.all([
    prisma.agency.count(),
    prisma.agent.count(),
    prisma.listing.count(),
  ]);

  console.log('\n📊 Seed complete:');
  console.log(`   Agencies : ${agencyCount}`);
  console.log(`   Agents   : ${agentCount}`);
  console.log(`   Listings : ${listingCount}`);

  if (listingCount < 300) {
    console.warn('⚠️  Listing count is below the 300 minimum target.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
