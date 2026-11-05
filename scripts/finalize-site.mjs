// Complete the generated CSP and validate the artifact before it can be published.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { parse } from "parse5";

const output = fileURLToPath(new URL("../dist/", import.meta.url));
const origin = "https://d2ganfb65vwpme.cloudfront.net";
const pages = new Map();
const failures = [];

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
}

for (const filename of await readdir(output, { recursive: true })) {
  if (!filename.endsWith(".html")) continue;
  let source = await readFile(path.join(output, filename), "utf8");
  const page = {
    ids: new Set(),
    links: [],
    scripts: [],
    styles: [],
    policy: "",
    source,
  };
  let policyLocation;
  let charsetEnd;
  walk(parse(source, { sourceCodeLocationInfo: true }), (node) => {
    const attrs = Object.fromEntries(
      (node.attrs ?? []).map(({ name, value }) => [name, value]),
    );
    if (attrs.id) {
      if (page.ids.has(attrs.id))
        failures.push(`${filename}: duplicate id ${attrs.id}`);
      page.ids.add(attrs.id);
    }
    for (const key of ["href", "src"])
      if (attrs[key]) page.links.push(attrs[key]);
    if (node.tagName === "meta" && attrs.charset)
      charsetEnd = node.sourceCodeLocation.endOffset;
    if (attrs["http-equiv"]?.toLowerCase() === "content-security-policy") {
      page.policy = attrs.content;
      policyLocation = node.sourceCodeLocation;
    }
    if (
      node.tagName === "script" &&
      !attrs.src &&
      (!attrs.type || attrs.type === "module")
    ) {
      page.scripts.push(
        node.childNodes.map((child) => child.value ?? "").join(""),
      );
    }
    if (node.tagName === "style")
      page.styles.push(
        node.childNodes.map((child) => child.value ?? "").join(""),
      );
  });
  // Astro hashes bundled scripts; Starlight also emits literal inline scripts.
  // Hash the final HTML and put the policy before every executable element.
  assert(policyLocation && charsetEnd, `${filename}: missing CSP or charset`);
  const hashes = (sources) =>
    [
      ...new Set(
        sources.map(
          (value) =>
            `'sha256-${createHash("sha256").update(value).digest("base64")}'`,
        ),
      ),
    ].join(" ");
  page.policy = page.policy
    .replace(
      /script-src\s+[^;]*/,
      `script-src 'self' 'wasm-unsafe-eval' ${hashes(page.scripts)}`,
    )
    .replace(
      /style-src-elem\s+[^;]*/,
      `style-src-elem 'self' ${hashes(page.styles)}`,
    );
  const edits = [
    {
      start: policyLocation.startOffset,
      end: policyLocation.endOffset,
      text: "",
    },
    {
      start: charsetEnd,
      end: charsetEnd,
      text: `<meta http-equiv="Content-Security-Policy" content="${page.policy}">`,
    },
  ];
  for (const edit of edits.sort((a, b) => b.start - a.start))
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  await writeFile(path.join(output, filename), source);
  page.source = source;
  pages.set("/" + filename.replaceAll(path.sep, "/"), page);
}

for (const [filename, page] of pages) {
  for (const link of page.links) {
    const url = new URL(link, origin + filename);
    if (url.origin !== origin) continue;
    // Match the private S3 origin exactly. Only / receives DefaultRootObject.
    const key = decodeURIComponent(
      url.pathname === "/" ? "/index.html" : url.pathname,
    );
    const target = path.join(output, key);
    try {
      if (!(await stat(target)).isFile()) throw new Error("Not a file");
    } catch {
      failures.push(`${filename}: missing exact object ${link}`);
      continue;
    }
    if (
      url.hash &&
      pages.has(key) &&
      !pages.get(key).ids.has(decodeURIComponent(url.hash.slice(1)))
    ) {
      failures.push(`${filename}: missing anchor ${link}`);
    }
  }
  assert(page.policy.includes("object-src 'none'"), `${filename}: missing CSP`);
  assert(
    !/script-src[^;]*'unsafe-(?:inline|eval)'/.test(page.policy),
    `${filename}: unsafe script policy`,
  );
  for (const source of [...page.scripts, ...page.styles]) {
    const hash = createHash("sha256").update(source).digest("base64");
    if (!page.policy.includes(`'sha256-${hash}'`))
      failures.push(`${filename}: inline code missing CSP hash`);
  }
}

for (const filename of [
  "index.html",
  "engineering.html",
  "projects/bototoolkit.html",
  "projects/brewmaster.html",
  "projects/kubernetes-operations.html",
  "projects/portfolio-engineering.html",
  "handbook.html",
  "handbook/aws/github-actions-oidc.html",
  "pagefind/pagefind.js",
]) {
  assert(
    (await stat(path.join(output, filename))).isFile(),
    `Missing release file: ${filename}`,
  );
}

assert.equal(failures.length, 0, failures.join("\n"));
const sitemap = await readFile(path.join(output, "sitemap-0.xml"), "utf8");
for (const [, address] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(address);
  assert(
    pages.has(url.pathname === "/" ? "/index.html" : url.pathname),
    `Sitemap URL has no exact S3 object: ${address}`,
  );
}
const homepage = pages.get("/index.html");
const assets = new Set(
  homepage.links.filter((link) => /\.(?:css|js|woff2)$/.test(link)),
);
let compressed = gzipSync(homepage.source).length;
for (const asset of assets)
  compressed += gzipSync(await readFile(path.join(output, asset))).length;
assert(
  compressed < 500 * 1024,
  `Homepage initial assets exceed 500 KiB: ${compressed}`,
);
console.log(
  `Checked ${pages.size} pages, exact S3 paths, anchors, and CSP hashes.`,
);
console.log(
  `Homepage + directly linked CSS/JS/fonts: ${(compressed / 1024).toFixed(1)} KiB gzip (search loads on demand).`,
);
