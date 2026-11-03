"""Build the portfolio from JSON, Markdown, and Jinja templates."""

import json
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape
from markdown_it import MarkdownIt
from markupsafe import Markup

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"


def load_profile(path=CONTENT / "profile.json"):
    profile = json.loads(path.read_text(encoding="utf-8"))
    for key in ("name", "headline", "intro", "email", "projects", "experience"):
        if not profile.get(key):
            raise ValueError(f"Missing profile field: {key}")
    slugs = set()
    for project in profile["projects"]:
        for key in (
            "slug",
            "title",
            "summary",
            "document",
            "subtitle",
            "category",
            "status",
            "stack",
        ):
            if not project.get(key):
                raise ValueError(f"Missing project field: {key}")
        slug = project["slug"]
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) or slug in slugs:
            raise ValueError(f"Invalid or duplicate project slug: {slug}")
        if Path(project["document"]).name != project["document"]:
            raise ValueError(
                "Project documents must be filenames within content/projects"
            )
        slugs.add(slug)
    return profile


class PageLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            if attrs.get(key):
                self.links.append(attrs[key])


def validate_links(output):
    output = output.resolve()
    pages = {}
    for page in output.rglob("*.html"):
        parser = PageLinks()
        parser.feed(page.read_text(encoding="utf-8"))
        pages[page.resolve()] = parser
    for page, parser in pages.items():
        for link in parser.links:
            url = urlsplit(link)
            if url.scheme in ("https", "http", "mailto"):
                continue
            if url.scheme or url.netloc:
                raise ValueError(f"Unsupported link in {page.name}: {link}")
            target = (page.parent / unquote(url.path)).resolve() if url.path else page
            if target.is_dir():
                target /= "index.html"
            if not target.is_relative_to(output) or not target.is_file():
                raise ValueError(f"Broken local link in {page.name}: {link}")
            if (
                url.fragment
                and target in pages
                and unquote(url.fragment) not in pages[target].ids
            ):
                raise ValueError(f"Missing anchor in {page.name}: {link}")


def build():
    profile = load_profile()
    markdown = MarkdownIt("commonmark", {"html": False})
    env = Environment(
        loader=FileSystemLoader(ROOT / "webapp/templates/portfolio"),
        autoescape=select_autoescape(["html"]),
        undefined=StrictUndefined,
    )
    pages = {
        "index.html": env.get_template("home.html").render(
            profile=profile,
            prefix="",
            title=profile["name"],
            description=profile["intro"],
        )
    }
    for project in profile["projects"]:
        document = (CONTENT / "projects" / project["document"]).read_text(
            encoding="utf-8"
        )
        tokens = markdown.parse(document)
        sections = []
        used_ids = set()
        for index, token in enumerate(tokens):
            if token.type == "heading_open" and token.tag == "h2":
                heading = tokens[index + 1].content
                slug = (
                    re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-") or "section"
                )
                anchor = slug
                suffix = 2
                while anchor in used_ids:
                    anchor = f"{slug}-{suffix}"
                    suffix += 1
                used_ids.add(anchor)
                token.attrSet("id", anchor)
                sections.append({"id": anchor, "title": heading})
        pages[f"projects/{project['slug']}.html"] = env.get_template(
            {
                "bototoolkit": "bototoolkit.html",
                "brewmaster": "brewmaster.html",
            }.get(project["slug"], "article.html")
        ).render(
            profile=profile,
            project=project,
            prefix="../",
            title=project["title"],
            description=project["summary"],
            body=Markup(markdown.renderer.render(tokens, markdown.options, {})),
            sections=sections,
        )
    engineering = (CONTENT / "engineering.md").read_text(encoding="utf-8")
    pages["engineering.html"] = env.get_template("article.html").render(
        profile=profile,
        prefix="",
        title="How this site ships",
        description="The decisions behind this portfolio.",
        project={
            "title": "How this site ships",
            "subtitle": "The work behind the work.",
            "category": "Engineering notes",
            "status": "In progress",
            "stack": ["Python", "uv", "Static HTML"],
        },
        body=Markup(markdown.render(engineering)),
    )
    output = ROOT / "dist"
    # Only replace this project's generated directory; never follow an output symlink.
    if output.is_symlink() or output.resolve() != ROOT.resolve() / "dist":
        raise ValueError("Refusing to replace an unexpected output directory")
    if output.exists():
        shutil.rmtree(output)
    (output / "assets").mkdir(parents=True)
    for name, html in pages.items():
        destination = output / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(html, encoding="utf-8")
    shutil.copy2(ROOT / "webapp/static/portfolio.css", output / "assets/portfolio.css")
    shutil.copytree(ROOT / "webapp/static/fonts", output / "assets/fonts")
    validate_links(output)
    print(f"Built {len(pages)} pages in dist/; local links checked.")
    return output


if __name__ == "__main__":
    build()
