// Prototype-only search. Astro/Starlight will use a generated Pagefind index.
const trigger = document.querySelector("[data-search]");
const entries = [
  {
    title: "Oscar Valdes — work & experience",
    url: "index.html",
    kind: "Portfolio",
    terms:
      "home about contact kalypso brewmaster kubernetes platform sre devops aws cloud",
  },
  {
    title: "BotoToolkit — investigate with context",
    url: "case-study.html",
    kind: "Case study",
    terms:
      "python boto3 typer rich uv amplify workflow identity configuration retry aws cloud",
  },
  {
    title: "GitHub Actions to AWS, without stored keys",
    url: "handbook.html",
    kind: "Handbook",
    terms:
      "oidc aws iam trust role permissions delivery infrastructure ci cd deployment",
  },
];

const dialog = document.createElement("dialog");
dialog.id = "preview-search";
dialog.setAttribute("aria-labelledby", "search-title");
dialog.innerHTML = `<div class="dialog-head"><h2 id="search-title">Explore the preview</h2><button type="button" class="close-search">Close</button></div>
<label for="search-query">Search the three preview pages</label>
<input id="search-query" type="search" name="q" autocomplete="off" placeholder="Try Python or AWS…" aria-describedby="search-status">
<p id="search-status" class="search-status" role="status"></p><ul class="search-results"></ul>`;
document.body.append(dialog);
const input = dialog.querySelector("input");
const results = dialog.querySelector("ul");
const status = dialog.querySelector('[role="status"]');

function renderResults() {
  const words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = entries.filter((entry) =>
    words.every((word) =>
      `${entry.title} ${entry.kind} ${entry.terms}`
        .toLowerCase()
        .includes(word),
    ),
  );
  results.replaceChildren();
  for (const entry of matches) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = entry.url;
    link.textContent = entry.title;
    const kind = document.createElement("span");
    kind.textContent = entry.kind;
    link.append(kind);
    item.append(link);
    results.append(item);
  }
  status.textContent = matches.length
    ? `${matches.length} preview ${matches.length === 1 ? "page" : "pages"}. Full-site search comes with the migration.`
    : "No matching preview pages. Try AWS, Python, or experience.";
}

function openSearch() {
  if (dialog.open) return;
  input.value = "";
  renderResults();
  dialog.showModal();
  input.focus();
}

trigger.hidden = false;
trigger.setAttribute("aria-controls", dialog.id);
trigger.addEventListener("click", openSearch);
dialog.querySelector("button").addEventListener("click", () => dialog.close());
dialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    dialog.close();
  }
});
input.addEventListener("input", renderResults);
document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "k" &&
    !event.target.closest('input,textarea,[contenteditable="true"]')
  ) {
    event.preventDefault();
    openSearch();
  }
});

// Start the topic rail collapsed on small screens without changing reading order.
const topics = document.querySelector(".topics");
if (topics) {
  const phoneLayout = window.matchMedia("(max-width: 760px)");
  const updateTopicNavigation = () => {
    topics.open = !phoneLayout.matches;
  };
  updateTopicNavigation();
  phoneLayout.addEventListener("change", updateTopicNavigation);
}
