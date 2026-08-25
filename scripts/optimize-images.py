"""Optimize local raster images referenced by public HTML and rewrite <img> tags.

Creates WebP originals capped at 1920px plus 640px/1280px responsive variants.
Only deletes a source PNG/JPEG after all HTML image references have been rewritten.
Run from the repository root: python scripts/optimize-images.py
"""
from __future__ import annotations

import re
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "images"
HTML_FILES = [p for p in ROOT.rglob("*.html") if ".git" not in p.parts]
IMG_RE = re.compile(r"<img\b[^>]*>", re.I | re.S)
SRC_RE = re.compile(r'''\bsrc=["'](/images/[^"']+\.(?:png|jpe?g))["']''', re.I)
ATTR_RE = re.compile(r'''\s(?:width|height|loading|fetchpriority|decoding|srcset|sizes)=["'][^"']*["']''', re.I)
MAX_WIDTH = 1920
QUALITY = 82


def webp_path(source: Path, width: int | None = None) -> Path:
    suffix = f"-{width}" if width else ""
    return source.with_name(f"{source.stem}{suffix}.webp")


def save_variant(image: Image.Image, destination: Path, width: int) -> tuple[int, int]:
    if image.width > width:
        height = round(image.height * width / image.width)
        output = image.resize((width, height), Image.Resampling.LANCZOS)
    else:
        output = image.copy()
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination, "WEBP", quality=QUALITY, method=6)
    return output.size


def optimize(source: Path) -> dict[str, object]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        original_size = image.size
        main_width = min(image.width, MAX_WIDTH)
        main = webp_path(source)
        main_size = save_variant(image, main, main_width)
        variants: list[tuple[int, Path]] = []
        for width in (640, 1280):
            if image.width > width:
                variant = webp_path(source, width)
                save_variant(image, variant, width)
                variants.append((width, variant))
        if not variants or variants[-1][0] != main_size[0]:
            variants.append((main_size[0], main))
        return {"original": original_size, "main": main, "main_size": main_size, "variants": variants}


def url(path: Path) -> str:
    return "/" + path.relative_to(ROOT).as_posix()


def rewrite_tag(tag: str, info: dict[str, object], high_priority: bool) -> str:
    source_match = SRC_RE.search(tag)
    assert source_match
    clean = ATTR_RE.sub("", tag)
    clean = SRC_RE.sub(f'src="{url(info["main"])}"', clean, count=1)
    width, height = info["original"]
    variants = info["variants"]
    srcset = ", ".join(f"{url(path)} {variant_width}w" for variant_width, path in variants)
    attrs = f' width="{width}" height="{height}" decoding="async"'
    if len(variants) > 1:
        attrs += f' srcset="{srcset}" sizes="100vw"'
    attrs += ' loading="eager" fetchpriority="high"' if high_priority else ' loading="lazy"'
    return clean[:-1].rstrip() + attrs + ">"


def main() -> None:
    references: dict[Path, dict[str, object]] = {}
    converted_sources: set[Path] = set()
    files_changed = 0

    for html in HTML_FILES:
        text = html.read_text(encoding="utf-8")
        hero_used = False

        def replace(match: re.Match[str]) -> str:
            nonlocal hero_used
            tag = match.group(0)
            src = SRC_RE.search(tag)
            if not src:
                return tag
            source = ROOT / src.group(1).lstrip("/")
            if not source.exists():
                return tag
            if source not in references:
                try:
                    references[source] = optimize(source)
                except (OSError, ValueError):
                    return tag
            is_hero = not hero_used and "position-absolute" in tag and "object-fit-cover" in tag
            if is_hero:
                hero_used = True
            converted_sources.add(source)
            return rewrite_tag(tag, references[source], is_hero)

        updated = IMG_RE.sub(replace, text)
        if updated != text:
            html.write_text(updated, encoding="utf-8", newline="")
            files_changed += 1

    # Repoint metadata, CSS and JavaScript to an existing WebP counterpart too.
    # This prevents a large PNG retained only by an og:image or background URL
    # from remaining in the production bundle.
    text_files: list[Path] = []
    for pattern in ("*.html", "*.css", "*.js", "*.xml", "*.txt"):
        text_files.extend(p for p in ROOT.rglob(pattern) if ".git" not in p.parts)
    for source in IMAGE_ROOT.rglob("*"):
        if source.suffix.lower() not in (".png", ".jpg", ".jpeg"):
            continue
        counterpart = webp_path(source)
        if not counterpart.exists():
            continue
        source_name = source.relative_to(IMAGE_ROOT).as_posix()
        counterpart_name = counterpart.relative_to(IMAGE_ROOT).as_posix()
        for path in text_files:
            text = path.read_text(encoding="utf-8", errors="ignore")
            updated = text.replace(f"images/{source_name}", f"images/{counterpart_name}")
            if updated != text:
                path.write_text(updated, encoding="utf-8", newline="")
                converted_sources.add(source)

    # Preserve a source if any text file still references its exact URL.
    remaining_text = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in text_files)
    removed = 0
    for source in converted_sources:
        source_url = "/" + source.relative_to(ROOT).as_posix()
        if source_url not in remaining_text:
            source.unlink()
            removed += 1

    before = sum(source.stat().st_size if source.exists() else 0 for source in converted_sources)
    generated = {info["main"] for info in references.values()}
    for info in references.values():
        generated.update(path for _, path in info["variants"])
    after = sum(path.stat().st_size for path in generated if path.exists())
    print(f"Optimized {len(references)} images across {files_changed} HTML files.")
    print(f"Removed {removed} superseded source files; generated assets total {after / 1048576:.1f} MB.")


if __name__ == "__main__":
    main()
