import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres"

export default async function globalSetup() {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("test_db")
    .withUsername("postgres")
    .withPassword("postgres")
    .start();

  process.env.TEST_DATABASE_URL = container.getConnectionUri();

  const db = drizzle({connection: {connectionString: process.env.TEST_DATABASE_URL}})

  await migrate(db, {
    migrationsFolder: "../src/db/migrations"
  });

  return async () => {
    await container.stop();
  };
}