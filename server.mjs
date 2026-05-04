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
const argv = new Set(process.argv.slice(2));
const explicitDev = argv.has("--dev") || process.env.NODE_ENV === "development";
const explicitProd =
  argv.has("--prod") || process.env.NODE_ENV === "production";
const hasProdBundle = hasProdClient && hasProdServer;
const isProd = explicitProd || (!explicitDev && hasProdBundle);
const setCommonHeaders = (res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
};
const sendHtml = (res, html, statusCode = 200) => {
  res.statusCode = statusCode;
  setCommonHeaders(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cache-Control", "no-store");
  res.end(html);
};
const sendText = (res, text, statusCode = 200) => {
  res.statusCode = statusCode;
  setCommonHeaders(res);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(text);
};
const hasFileExtension = (pathname) => path.extname(pathname).length > 0;
const isDevModuleRequest = (pathname) =>
  pathname.startsWith("/@vite/") ||
  pathname.startsWith("/@react-refresh") ||
  pathname.startsWith("/src/") ||
  pathname.startsWith("/node_modules/") ||
  pathname.startsWith("/@fs/");
const isSsrRoute = (pathname) =>
  pathname === "/" ||
  pathname === "/hotels" ||
  pathname === "/hotels/" ||
  pathname === "/restaurant-homepage" ||
  pathname === "/restaurant-homepage/" ||
  pathname === "/resturant-homepage" ||
  pathname === "/resturant-homepage/" ||
  pathname === "/cafe-homepage" ||
  pathname === "/cafe-homepage/" ||
  pathname === "/cafe-page" ||
  pathname === "/cafe-page/" ||
  pathname === "/wine-homepage" ||
  pathname === "/wine-homepage/" ||
  pathname === "/offers" ||
  pathname === "/offers/" ||
  pathname === "/events" ||
  pathname === "/events/" ||
  pathname === "/news" ||
  pathname === "/news/" ||
  pathname.startsWith("/wine-detail/") ||
  pathname.startsWith("/wine-categories/") ||
  pathname.startsWith("/wine-subcategory/") ||
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

        if (!hasFileExtension(pathname) && !isDevModuleRequest(pathname)) {
          const templatePath = resolveFromRoot("client", "index.html");
          const rawTemplate = await fs.readFile(templatePath, "utf-8");
          const template = await vite.transformIndexHtml(url, rawTemplate);
          sendHtml(res, template);
          return;
        }

        vite.middlewares(req, res, () => {
          sendText(res, "Not Found", 404);
        });
        return;
      }

      // Production mode
      const clientDir = resolveFromRoot("public_html");
      const serverEntryPath = resolveFromRoot(
        "public_html-ssr",
        "entry-server.js",
      );

      if (isSsrRoute(pathname)) {
        const template = await fs.readFile(
          path.join(clientDir, "index.html"),
          "utf-8",
        );
        try {
          const { render } = await import(serverEntryPath);
          const { html } = await render(url, template);
          sendHtml(res, html);
        } catch (ssrErr) {
          console.error("SSR render failed for", pathname, "— falling back to SPA template:", ssrErr?.message || ssrErr);
          sendHtml(res, template);
        }
        return;
      }

      // if (!hasFileExtension(pathname)) {
      //   const template = await fs.readFile(path.join(clientDir, "index.html"), "utf-8");
      //   sendHtml(res, template);
      //   return;
      // }
      if (!hasFileExtension(pathname)) {
        try {
          const template = await fs.readFile(
            path.join(clientDir, "index.html"),
            "utf-8",
          );

          const { render } = await import(serverEntryPath);

          const { html } = await render(url, template);

          console.log("⚡ SSR ATTEMPT:", pathname);

          sendHtml(res, html);
          return;
        } catch (err) {
          console.warn("⚠️ SSR FAILED, FALLBACK TO SPA:", pathname);

          const template = await fs.readFile(
            path.join(clientDir, "index.html"),
            "utf-8",
          );

          sendHtml(res, template);
          return;
        }
      }

      const filePath = path.join(
        clientDir,
        pathname === "/" ? "index.html" : pathname,
      );
      const data = await fs.readFile(filePath).catch(() => null);
      if (!data) {
        sendText(res, "Not Found", 404);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === ".js"
          ? "text/javascript; charset=utf-8"
          : ext === ".css"
            ? "text/css; charset=utf-8"
            : ext === ".html"
              ? "text/html; charset=utf-8"
              : undefined;

      setCommonHeaders(res);
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      if (ext === ".html") {
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "no-store");
      }
      res.statusCode = 200;
      res.end(data);
    } catch (error) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(error);
      }
      res.statusCode = 500;
      sendText(res, error?.stack || String(error), 500);
    }
  });

  const port = Number(process.env.PORT || 5173);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`SSR server running at http://localhost:${port}`);
  });
};

start();
