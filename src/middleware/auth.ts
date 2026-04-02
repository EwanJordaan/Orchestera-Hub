import { createHash } from "node:crypto";
import { db } from "../db/connection";
import { type Context } from "hono";
import { sign, verify } from "hono/jwt";
import { jwt_tokens, memberships, users } from "../db/schema";
import { and, eq, isNull } from "drizzle-orm";

type LoginBody = {
    email?: string;
    password?: string;
    rememberMe?: boolean;
};

const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");

const getBearerToken = (c: Context) => {
    const authorization = c.req.header("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return null;
    }

    return authorization.slice("Bearer ".length);
};

export const login = async (c: Context) => {
    const { email, password, rememberMe }: LoginBody = await c.req.json();
    
    if(!email || !password){
        return c.json({error: "Missing email and password"});
    }

    const hashedPassword = hashToken(password);

    const [account] = await db
        .select({
            id: users.id,
            tenantId: memberships.tenant_id,
            email: users.email,
            passwordHash: users.password_hash,
            role: memberships.role,
        })
        .from(users)
        .leftJoin(
            memberships,
            eq(memberships.user_id, users.id),
        )
        .where(eq(users.email, email))
        .limit(1);

    if(!account){
        return c.json({error: "User not found"}, 404);
    }

    if(!account.tenantId || !account.role){
        return c.json({error: "User membership not configured"}, 403);
    }

    if(!account.passwordHash){
        return c.json({error: "Invalid password"}, 401);
    }

    if(account.passwordHash !== hashedPassword){
        return c.json({error: "Invalid password"}, 401);
    }

    let expireAt = Math.floor(Date.now() / 1000) + (60 * 60);

    if(rememberMe){
        expireAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
    }

    const expireAtDate = new Date(expireAt * 1000);

    const payload = {
        sub: account.id,
        tenant_id: account.tenantId,
        email: account.email,
        role: account.role,
        exp: expireAt,
    };

    if(!process.env.JWT_SECRET){
        return c.json({error: "Missing JWT_SECRET"}, 500);
    }

    const jwt = await sign(payload, process.env.JWT_SECRET);

    const tokenHash = hashToken(jwt);

    try{
        await db.insert(jwt_tokens).values({
            id: crypto.randomUUID(),
            user_id: account.id,
            tenant_id: account.tenantId,
            token_hash: tokenHash,
            expires_at: expireAtDate,
        });
    } catch(error: any){
        return c.json({error: error.message}, 500);
    }

    return c.json({token: jwt});
}

export const logout = async (c: Context) => {
    const token = getBearerToken(c);

    if(!token){
        return c.json({error: "Missing token"}, 401);
    }

    const tokenHash = hashToken(token);

    try{
        const [revokedToken] = await db
            .update(jwt_tokens)
            .set({ revoked_at: new Date() })
            .where(
                and(
                    eq(jwt_tokens.token_hash, tokenHash),
                    isNull(jwt_tokens.revoked_at),
                ),
            )
            .returning({ id: jwt_tokens.id });

        if (!revokedToken) {
            return c.json({error: "Invalid token"}, 401);
        }
    } catch(error: any){
        return c.json({error: error.message}, 500);
    }

    return c.json({message: "Logged out successfully"});
}

export const auth = async (c: Context, next: () => Promise<void>) => {
    const token = getBearerToken(c);

    if(!token){
        return c.json({error: "Missing token"}, 401);
    }

    if(!process.env.JWT_SECRET){
        return c.json({error: "Missing JWT_SECRET"}, 500);
    }

    const tokenHash = hashToken(token);

    try {
        await verify(token, process.env.JWT_SECRET, "HS256");
    } catch {
        return c.json({error: "Invalid token"}, 401);
    }

    const [tokenData] = await db
        .select({
            id: jwt_tokens.id,
            revokedAt: jwt_tokens.revoked_at,
            expiresAt: jwt_tokens.expires_at,
        })
        .from(jwt_tokens)
        .where(eq(jwt_tokens.token_hash, tokenHash))
        .limit(1);

    if(!tokenData){
        return c.json({error: "Invalid token"}, 401);
    }

    if(tokenData.revokedAt){
        return c.json({error: "Token revoked"}, 401);
    }

    if(tokenData.expiresAt <= new Date()){
        return c.json({error: "Token expired"}, 401);
    }

    await next();
}
