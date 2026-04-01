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

    let expire = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30);

    if(!rememberMe){
        expire = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
    }

    const Payload = {
        sub: user.rows[0].id,
        email: user.rows[0].email,
        role: user.rows[0].role,
        exp: expire
    }

    if(!process.env.JWT_SECRET){
        return c.json({error: "Missing JWT_SECRET"});
    }

    const jwt = await sign(Payload, process.env.JWT_SECRET);

    const tokenHash = hash(jwt);

    try{
        await query("INSERT INTO app.jwt_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)", [crypto.randomUUID(), user.rows[0].id, tokenHash, expire]);
    } catch(error: any){
        return c.json({error: error.message});
    }

    return c.json({token: jwt});
}