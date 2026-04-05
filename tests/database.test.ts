import { describe, it, expect } from 'vitest';
import { createHash } from "node:crypto";
import { users, tenants } from "../src/db/schema.ts";
import * as schema from "../src/db/schema.ts"
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres"
import { login } from '../src/middleware/auth.ts';

const db = drizzle({
    connection: {
      connectionString: process.env.TEST_DATABASE_URL!,
    },
    schema,
});

const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");

const tenant_id = crypto.randomUUID(); 
const user_id = crypto.randomUUID(); 
db.insert(tenants).values({
  id: tenant_id,
  name: "test1",
  slug: "test1"
});
db.insert(users).values({
  id: user_id,
  tenant_id: tenant_id,
  email: "test@gmail.com",
  password_hash: hashToken("test")
})

describe("auth test", async () => {
  it("login test", async () => {
    
  })
})