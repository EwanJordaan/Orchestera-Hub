import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import { login, getJwtSecret } from "./auth"

type Variables = JwtVariables;

export const Auth = new Hono();
export const App = new Hono<{ Variables: Variables }>();

App.all("*", jwt({
    secret: getJwtSecret(),
    alg: 'ES256'
}));