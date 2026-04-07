import { users, memberships, api_keys, tenants } from "../db/schema"
import { db } from "../db/connection";
import { eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import { sign, jwt } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import type { Variables } from "hono/types";
import type { loginDetails, jwtPayload } from "../types/auth"

const SALT_ROUNDS = 12

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function login(c: Context){
    const { password, email, rememberMe } = await c.req.json<loginDetails>();

    if(!password || !email) {
        return c.json({error: "Missing Email Or Password"}, 401);
    }

    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if(!user[0]){
        return c.json({error: "Incorrect email or password"}, 401)
    }

    if(!await bcrypt.compare(password, user[0].password_hash)){
        return c.json({error: "Incorrect email or password"}, 401);
    }

    const expires_at = !rememberMe ? Math.floor(Date.now() / 1000) + 60 * 5 : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

    const payload: jwtPayload = {
        sub: user[0].id,
        sid: user[0].tenant_id,
        role: user[0].role,
        iss: "localhost:3000",
        aud: "https://localhost:3000",
        iat: Date.now() / 1000,
        exp: expires_at
    };

    const jwtSecret = await process.env.JWT_SECRET!;

    if(!jwtSecret){
        return c.json({error: "Missing JWT Secret"}, 401)
    }

    const jwtToken = sign(payload, jwtSecret, "ES256");

    return c.json({token: jwtToken});
}

export async function auth(c: Context, next: Next){
    const jwtSecret = process.env.JWT_SECRET!;

    if(!jwtSecret){
        return c.json({error: "Missing JWT Secret"}, 401);
    }

    const jwtMiddleware = jwt({ secret: jwtSecret, alg: "ES256"});
    await jwtMiddleware(c, async () => {});

    const payload: any = c.get("jwtPayload");
    const user_id = payload.sub;

    const user = await db.select().from(users).where(eq(users.id, user_id)).limit(1);

    if(!user[0]){
        return c.json({error: "Invalid authentication"}, 401);
    }

    const tokenIssuedAt = payload.iat;
    if(user[0].updated_at && tokenIssuedAt < user[0].updated_at){
        return c.json({error: "Invalid Auth: Please Login Again"}, 401);
    }

    await next();
}