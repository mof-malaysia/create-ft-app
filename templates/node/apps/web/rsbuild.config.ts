import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { THEME_KEY } from "./src/theme";

// Applies the saved (or OS) theme before first paint, so a dark-mode visitor
// never sees a light flash.
const themeScript = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.add(t)}catch(e){}`;

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: "{{title}}",
    tags: [{ tag: "script", head: true, append: false, children: themeScript }],
  },
  // @if api
  server: {
    // The api dev server owns :3000. Everything it serves is proxied, so the
    // browser sees one origin, as it does in the Docker image.
    port: 3001,
    proxy: [
      {
        // Rsbuild 2 takes http-proxy-middleware v3 options: an unknown key
        // such as `context` is ignored and every request gets proxied.
        pathFilter: ["/v1", "/healthz", "/docs", "/openapi.json"],
        // The api listens on 127.0.0.1 (HOST in src/env.ts). "localhost" can
        // resolve to ::1 first and reach another server on [::1]:3000.
        target: "http://127.0.0.1:3000",
      },
    ],
  },
  // @endif
});
