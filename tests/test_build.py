"""Focused checks for failures that would break a static release."""

import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "portfolio_build", ROOT / "scripts/build.py"
)
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def test_missing_content_fails_with_useful_error(tmp_path):
    profile = tmp_path / "profile.json"
    profile.write_text(json.dumps({"name": "Oscar"}), encoding="utf-8")
    with pytest.raises(ValueError, match="Missing profile field"):
        builder.load_profile(profile)


def test_broken_local_links_fail(tmp_path):
    page = tmp_path / "index.html"
    page.write_text('<a href="missing.html">Project</a>', encoding="utf-8")
    with pytest.raises(ValueError, match="Broken local link"):
        builder.validate_links(tmp_path)
    page.write_text('<a href="#missing">Work</a>', encoding="utf-8")
    with pytest.raises(ValueError, match="Missing anchor"):
        builder.validate_links(tmp_path)


def test_build_contains_only_publishable_pages_and_assets():
    output = builder.build()
    assert len(list(output.rglob("*.html"))) == 5
    assert (output / "assets/portfolio.css").is_file()
    assert not list(output.rglob("*.pdf"))
    assert not list(output.rglob("*.py"))
