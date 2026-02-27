import { Hono, Context } from "hono";

export function createRoutes(): Hono {
	const app = new Hono();
	app.get("/health", (c: Context) => {
		return c.json({ status: "healthy" });
	});

	return app;
}
