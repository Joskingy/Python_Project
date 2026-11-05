import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://d2ganfb65vwpme.cloudfront.net",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "never" },
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
      ],
      // Starlight code highlighting applies element-level styles.
      styleDirective: {
        resources: [
          { resource: "'self'", kind: "element" },
          { resource: "'unsafe-inline'", kind: "attribute" },
        ],
      },
      // Pagefind uses WebAssembly. JavaScript eval remains blocked.
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
    },
  },
  integrations: [
    sitemap({
      serialize(item) {
        const url = new URL(item.url);
        if (url.pathname === "/404" || url.pathname === "/404.html")
          return undefined;
        if (url.pathname !== "/" && !url.pathname.endsWith(".html")) {
          url.pathname = url.pathname.replace(/\/$/, "") + ".html";
        }
        return { ...item, url: url.href };
      },
    }),
    starlight({
      title: "Oscar Valdes",
      description: "Practical notes on AWS, delivery, Kubernetes, and Python.",
      favicon: "/favicon.svg",
      customCss: ["./src/styles/tokens.css", "./src/styles/handbook.css"],
      components: {
        Header: "./src/components/Header.astro",
        Footer: "./src/components/HandbookFooter.astro",
        ThemeProvider: "./src/components/DarkTheme.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      sidebar: [
        { label: "Handbook", slug: "handbook" },
        {
          label: "AWS & delivery",
          items: [{ autogenerate: { directory: "handbook/aws" } }],
        },
        {
          label: "Infrastructure as code",
          items: [{ autogenerate: { directory: "handbook/iac" } }],
        },
        {
          label: "Kubernetes",
          items: [{ autogenerate: { directory: "handbook/kubernetes" } }],
        },
        {
          label: "Python",
          items: [{ autogenerate: { directory: "handbook/python" } }],
        },
      ],
      expressiveCode: {
        themes: ["github-dark"],
        styleOverrides: { borderColor: "#282828" },
      },
      head: [
        { tag: "meta", attrs: { name: "theme-color", content: "#000000" } },
        ...["space-grotesk-latin", "dela-gothic-one-latin"].map((font) => ({
          tag: "link",
          attrs: {
            rel: "preload",
            href: `/fonts/${font}.woff2`,
            as: "font",
            type: "font/woff2",
            crossorigin: "anonymous",
          },
        })),
      ],
      lastUpdated: true,
      credits: false,
      disable404Route: true,
    }),
  ],
});
