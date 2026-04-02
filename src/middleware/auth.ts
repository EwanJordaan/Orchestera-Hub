import { hash } from "bun";
import { query } from "../db/connection";
import { type Context } from "hono";
import { sign } from "hono/jwt";

export const login = async (c: Context) => {
    const { email, password, rememberMe } = await c.req.json();
    
    if(!email || !password){
        return c.json({error: "Missing email and password"});
    }

    const hashed_password = hash(password);

    const user = await query("SELECT * FROM app.users WHERE email = $1", [email]);

    if(user.rowCount === 0){
        return c.json({error: "User not found"});
    }

    if(user.rows[0].password_hash !== hashed_password){
        return c.json({error: "Invalid password"});
    }

    let expireAt = Math.floor(Date.now() / 1000) + (60 * 60);

    if(!rememberMe){
        expireAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
    }

    const expireAtDate = new Date(expireAt * 1000);

    const Payload = {
        sub: user.rows[0].id,
        email: user.rows[0].email,
        role: user.rows[0].role,
        exp: expireAt
    }

    if(!process.env.JWT_SECRET){
        return c.json({error: "Missing JWT_SECRET"});
    }

    const jwt = await sign(Payload, process.env.JWT_SECRET);

    const tokenHash = hash(jwt);

    try{
        await query("INSERT INTO app.jwt_tokens (id, user_id, tenant_id, token_hash, expires_at) VALUES ($1, $2, $3, $4);", [crypto.randomUUID(), user.rows[0].id, user.rows[0].tenant_id, tokenHash, expireAtDate]);
    } catch(error: any){
        return c.json({error: error.message});
    }

    return c.json({token: jwt});
}

export const logout = async (c: Context) => {
    const token = c.req.header("Authorization")?.split(" ")[1];

    if(!token){
        return c.json({error: "Missing token"});
    }

    const tokenHash = hash(token);

    try{
        await query("UPDATE app.jwt_tokens SET revoked_at = now() WHERE token_hash = $1", [tokenHash]);
    } catch(error: any){
        return c.json({error: error.message});
    }

    return c.json({message: "Logged out successfully"});
}

export const auth = async (c: Context, next: () => Promise<void>) => {
    const token = c.req.header("Authorization")?.split(" ")[1];

    if(!token){
        return c.json({error: "Missing token"});
    }

    const tokenHash = hash(token);

    const tokenData = await query("SELECT * FROM app.jwt_tokens WHERE token_hash = $1", [tokenHash]);

    if(tokenData.rowCount === 0){
        return c.json({error: "Invalid token"});
    }

    if(tokenData.rows[0].revoked_at){
        return c.json({error: "Token revoked"});
    }

    next();
}