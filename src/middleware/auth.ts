import { users, memberships, api_keys, tenants } from "../db/schema"
import { db } from "../db/connection";
import { eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function getJwtSecret(): string{
    const jwtSecret = process.env.JWT_SECRET!;

    if(!jwtSecret){
        return " ";
    }

    return jwtSecret;
}

export async function login(c: Context){
    const { password, email, rememberMe } = c.req.json;

    if(!password || !email) {
        return c.json({error: "Missing Email Or Password"});
    }

    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if(!user){
        return c.json({error: "Incorrect email or password"})
    }

    if(!await verifyPassword(password, user.password_hash)){
        return c.json({error: "Incorrect email or password"})
    }

    const payload = {
        sub: 
    }
}