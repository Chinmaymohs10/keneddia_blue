import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolveFromRoot = (...parts) => path.resolve(__dirname, ...parts);
const hasProdClient = existsSync(resolveFromRoot("public_html", "index.html"));
const hasProdServer = existsSync(
  resolveFromRoot("public_html-ssr", "entry-server.js"),
);
const hasSourceClient = existsSync(resolveFromRoot("client", "index.html"));
const isProd =
  process.env.NODE_ENV === "production" ||
  process.argv.includes("--prod") ||
  (hasProdClient && hasProdServer && !hasSourceClient);
const sendHtml = (res, html) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
};
const isSsrRoute = (pathname) =>
  pathname === "/" ||
  pathname === "/hotels" ||
  pathname === "/hotels/" ||
  pathname === "/offers" ||
  pathname === "/offers/" ||
  pathname === "/events" ||
  pathname === "/events/" ||
  pathname === "/news" ||
  pathname === "/news/" ||
  /^\/[^/]+\/[^/]+-\d+\/[^/]+\/?$/.test(pathname) ||
  /^\/[^/]+\/[^/]+-\d+\/?$/.test(pathname) ||
  /^\/events\/[^/]+\/?$/.test(pathname) ||
  /^\/news\/[^/]+\/?$/.test(pathname);

const start = async () => {
  let vite;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
  }

  const server = http.createServer(async (req, res) => {
    const url = req.url || "/";
    const pathname = new URL(url, "http://localhost").pathname;

    try {
      if (!isProd) {
        if (isSsrRoute(pathname)) {
          const templatePath = resolveFromRoot("client", "index.html");
          const rawTemplate = await fs.readFile(templatePath, "utf-8");
          const template = await vite.transformIndexHtml(url, rawTemplate);
          const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");
          const { html } = await render(url, template);
          sendHtml(res, html);
          return;
        }

        vite.middlewares(req, res, async () => {
          const templatePath = resolveFromRoot("client", "index.html");
          const rawTemplate = await fs.readFile(templatePath, "utf-8");
          const template = await vite.transformIndexHtml(url, rawTemplate);
          sendHtml(res, template);
        });
        return;
      }

      // Production mode
      const clientDir = resolveFromRoot("public_html");
      const serverEntryPath = resolveFromRoot("public_html-ssr", "entry-server.js");

      if (isSsrRoute(pathname)) {
        const template = await fs.readFile(path.join(clientDir, "index.html"), "utf-8");
        const { render } = await import(serverEntryPath);
        const { html } = await render(url, template);
        sendHtml(res, html);
        return;
      }

      const filePath = path.join(clientDir, pathname === "/" ? "index.html" : pathname);
      const fallbackPath = path.join(clientDir, "index.html");
      const data = await fs.readFile(filePath).catch(() => fs.readFile(fallbackPath));
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === ".js"
          ? "text/javascript; charset=utf-8"
          : ext === ".css"
            ? "text/css; charset=utf-8"
            : ext === ".html"
              ? "text/html; charset=utf-8"
              : undefined;

      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.statusCode = 200;
      res.end(data);
    } catch (error) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(error);
      }
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(error?.stack || String(error));
    }
  });

  const port = Number(process.env.PORT || 5173);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`SSR server running at http://localhost:${port}`);
  });
};

start();
