import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Env } from "@/config/env.config";
import { positionLevels } from "@/drizzle/schema/positionLevels.schema";

const positionLevelData = [
  {
    name: 'Intern',
    level: 0,
    deposit: 0,
    tasksPerDay: 5,
    unitPrice: 13,
  },
  {
    name: 'L1',
    level: 1,
    deposit: 2000,
    tasksPerDay: 5,
    unitPrice: 13,
  },
  {
    name: 'L2',
    level: 2,
    deposit: 5000,
    tasksPerDay: 8,
    unitPrice: 21,
  },
  {
    name: 'L3',
    level: 3,
    deposit: 20000,
    tasksPerDay: 10,
    unitPrice: 72,
  },
  {
    name: 'L4',
    level: 4,
    deposit: 50000,
    tasksPerDay: 15,
    unitPrice: 123,
  },
  {
    name: 'L5',
    level: 5,
    deposit: 100000,
    tasksPerDay: 20,
    unitPrice: 192,
  },
  {
    name: 'L6',
    level: 6,
    deposit: 250000,
    tasksPerDay: 22,
    unitPrice: 454,
  },
  {
    name: 'L7',
    level: 7,
    deposit: 500000,
    tasksPerDay: 25,
    unitPrice: 836,
  },
  {
    name: 'L8',
    level: 8,
    deposit: 1000000,
    tasksPerDay: 27,
    unitPrice: 1611,
  },
  {
    name: 'L9',
    level: 9,
    deposit: 2000000,
    tasksPerDay: 30,
    unitPrice: 3033,
  },
  {
    name: 'L10',
    level: 10,
    deposit: 4000000,
    tasksPerDay: 31,
    unitPrice: 6129,
  },
  {
    name: 'L11',
    level: 11,
    deposit: 8000000,
    tasksPerDay: 32,
    unitPrice: 12500,
  },
];

async function seedPositionLevels() {
  console.log('Seeding position levels...');
  
  // Create a new database client for seeding
  const client = postgres(Env.DATABASE_URL!);
  const db = drizzle(client);
  
  try {
    // First, let's delete all existing position levels
    await db.delete(positionLevels);
    console.log('Deleted existing position levels');

    // Then create new ones
    for (const position of positionLevelData) {
      await db.insert(positionLevels).values(position);
      console.log(`✓ Created position: ${position.name}`);
    }

    console.log('Position levels seeded successfully!');
  } catch (error) {
    console.error('Error seeding position levels:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    await seedPositionLevels();
  } catch (error) {
    console.error('Error seeding position levels:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { seedPositionLevels };