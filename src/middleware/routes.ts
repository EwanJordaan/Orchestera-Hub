import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import { login, auth } from "./auth"

type Variables = JwtVariables;

export const Auth = new Hono();
export const App = new Hono<{ Variables: Variables }>();

App.all("*", auth);