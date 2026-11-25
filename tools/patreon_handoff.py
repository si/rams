"""Build the Patreon handoff page for a match post: every field Si pastes into
Patreon, in order, with copy buttons, plus the images to upload where they go.

Usage: python3 tools/patreon_handoff.py posts/<post>.md <out.html>

Reads the post draft's "Title field", "Public preview" and "Patrons-only body"
code blocks, splits the body at its images, finds the hero image in the post's
assets folder and lists "Still open" items as pre-publish checks. Publish the
output as an Artifact with capabilities {"downloads": true} so the image save
buttons work; without it the page falls back to copy-image / right-click save.
"""
import base64
import html
import mimetypes
import os
import re
import sys


def section(md, heading):
    """Text of a '## heading...' section up to the next top-level '## '
    outside a code fence."""
    m = re.search(r"^## " + re.escape(heading) + r".*$", md, re.M)
    if not m:
        return ""
    out, fence = [], False
    for line in md[m.end():].splitlines()[1:]:
        if line.startswith("```"):
            fence = not fence
        if not fence and line.startswith("## "):
            break
        out.append(line)
    return "\n".join(out)


def fenced(text):
    m = re.search(r"^```[^\n]*\n(.*?)^```", text, re.M | re.S)
    return m.group(1).rstrip("\n") if m else ""


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2">\1</a>', s)
    return s


def md_to_html(text):
    """Small Markdown subset used in the posts: ##/### headings, bold, links,
    > quotes, and line-by-line paragraphs (XI and subs lists rely on that)."""
    blocks, para, quote = [], [], []

    def flush():
        if para:
            blocks.append("<p>" + "<br>".join(inline(l) for l in para) + "</p>")
            para.clear()
        if quote:
            blocks.append("<blockquote><p>" + "<br>".join(inline(l) for l in quote) + "</p></blockquote>")
            quote.clear()

    for line in text.splitlines():
        if not line.strip():
            flush()
        elif m := re.match(r"^(#{2,3}) (.*)", line):
            flush()
            n = len(m.group(1))
            blocks.append(f"<h{n}>{inline(m.group(2))}</h{n}>")
        elif line.startswith(">"):
            if para:
                flush()
            quote.append(line.lstrip("> ").rstrip())
        else:
            if quote:
                flush()
            para.append(line)
    flush()
    return "\n".join(blocks)


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


def main():
    post, out = sys.argv[1], sys.argv[2]
    base = os.path.dirname(post)
    md = open(post, encoding="utf-8").read()
    slug = os.path.splitext(os.path.basename(post))[0]
    name = re.search(r"^# (?:Draft: )?(.*)", md, re.M).group(1).strip()

    title = fenced(section(md, "Title field"))
    preview = fenced(section(md, "Public preview"))
    body = fenced(section(md, "Patrons-only body"))
    still_open = re.findall(r"^- (.*)", section(md, "Still open"), re.M)
    hero = next((os.path.join(base, "assets", slug, f) for f in sorted(os.listdir(os.path.join(base, "assets", slug)))
                 if f.startswith("hero-")), None)

    # Split body into text chunks and images, in order
    parts, buf = [], []
    for line in body.splitlines():
        m = re.match(r"^!\[(.*)\]\((.+)\)\s*$", line)
        if m:
            if "\n".join(buf).strip():
                parts.append(("text", "\n".join(buf).strip("\n")))
            buf = []
            parts.append(("image", m.group(1), os.path.join(base, m.group(2))))
        else:
            buf.append(line)
    if "\n".join(buf).strip():
        parts.append(("text", "\n".join(buf).strip("\n")))

    n = 0

    def text_card(label, md_text, rich=True, hint=""):
        nonlocal n
        n += 1
        return f"""
<section class="card" id="c{n}">
  <header><span class="step">{n}</span><h2>{html.escape(label)}</h2>
    <button class="btn" data-copy="t{n}">Copy</button></header>
  {f'<p class="hint">{hint}</p>' if hint else ''}
  <div class="copytext{' rich' if rich else ''}" id="t{n}" data-md="{html.escape(md_text)}">{md_to_html(md_text) if rich else html.escape(md_text)}</div>
</section>"""

    def image_card(label, alt, path, hint):
        nonlocal n
        n += 1
        fname = os.path.basename(path)
        return f"""
<section class="card img" id="c{n}">
  <header><span class="step">{n}</span><h2>{html.escape(label)}</h2>
    <span class="btns"><button class="btn" data-img="i{n}">Copy image</button>
    <button class="btn save" data-save="i{n}" data-name="{html.escape(fname)}" hidden>Save {html.escape(fname)}</button></span></header>
  <p class="hint">{hint}</p>
  <img id="i{n}" src="{data_uri(path)}" alt="{html.escape(alt)}">
  {f'''<div class="alt"><span class="label">Image description</span>
    <button class="btn small" data-copy="a{n}">Copy</button>
    <p class="copytext plain" id="a{n}" data-md="{html.escape(alt)}">{html.escape(alt)}</p></div>''' if alt else ''}
</section>"""

    cards = []
    if hero:
        cards.append(image_card("Cover image", "", hero, "Upload as the post's main image, at the top."))
    cards.append(text_card("Title", title, rich=False))
    cards.append(text_card("Public preview", preview, hint="Above the paywall, visible to everyone."))
    paywall_done = False
    for p in parts:
        if p[0] == "text":
            label = "Patrons-only body" if not paywall_done else "Body, continued"
            hint = "Insert the paywall break first, then paste this below it." if not paywall_done else "Paste below the image above."
            paywall_done = True
            cards.append(text_card(label, p[1], hint=hint))
        else:
            cards.append(image_card("Image", p[1], p[2], "Upload here, then paste the description into the image's caption/alt field."))

    checks = "".join(f'<li><label><input type="checkbox" id="chk{i}"> <span>{inline(t)}</span></label></li>'
                     for i, t in enumerate(still_open))

    page = TEMPLATE.replace("{{NAME}}", html.escape(name)).replace("{{CARDS}}", "".join(cards)) \
        .replace("{{CHECKS}}", checks or "<li>Nothing open.</li>").replace("{{COUNT}}", str(n))
    with open(out, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"{out}: {n} steps, {len(still_open)} checks")


TEMPLATE = r"""<title>{{NAME}} Patreon</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Inter:wght@400;500;600&display=swap">
<style>
/* Layout: a single column of numbered paste steps, in the order they go into Patreon */
:root {
  --bg: #f6f5f1; --surface: #ffffff; --fg: #17150f; --muted: #6b6656;
  --line: #e2ddd0; --gold: #cda301; --gold-ink: #6e5700; --ok: #2f7d3b;
  --display: "Alfa Slab One", Georgia, serif;
  --body: "Inter", system-ui, -apple-system, sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #14130f; --surface: #1e1c17; --fg: #f1eee4; --muted: #a39d8a;
  --line: #35322a; --gold: #e0b81a; --gold-ink: #e0b81a; --ok: #6cc47a; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #14130f; --surface: #1e1c17; --fg: #f1eee4; --muted: #a39d8a;
  --line: #35322a; --gold: #e0b81a; --gold-ink: #e0b81a; --ok: #6cc47a; color-scheme: dark }
body { background: var(--bg); color: var(--fg); font: 15px/1.55 var(--body); }
.wrap { max-width: 760px; margin: 0 auto; padding-block: 32px 64px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  display: grid; gap: 20px; }
.top { border-bottom: 4px solid var(--gold); padding-bottom: 16px; }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: 12px; font-weight: 600; color: var(--gold-ink); }
h1 { font: 34px/1.15 var(--display); margin: 6px 0 4px; text-wrap: balance; }
.sub { color: var(--muted); margin: 0; }
.checks { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; }
.checks h2 { font: 600 15px var(--body); margin: 0 0 8px; }
.checks ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.checks label { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; }
.checks input { margin-top: 4px; accent-color: var(--gold); }
.checks input:checked + span { color: var(--muted); text-decoration: line-through; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; min-width: 0; }
.card header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.card h2 { font: 20px/1.2 var(--display); margin: 0; flex: 1; min-width: 0; }
.step { width: 30px; height: 30px; border-radius: 50%; background: var(--gold); color: #17150f;
  display: grid; place-items: center; font: 600 14px var(--body); font-variant-numeric: tabular-nums; flex: none; }
.btns { display: flex; gap: 8px; flex-wrap: wrap; }
.btn { font: 600 14px var(--body); border: 1px solid var(--fg); background: var(--fg); color: var(--bg);
  border-radius: 6px; padding: 7px 14px; cursor: pointer; }
.btn.save, .btn.small { background: transparent; color: var(--fg); }
.btn.small { padding: 3px 10px; font-size: 13px; }
.btn:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
.btn.done { background: var(--ok); border-color: var(--ok); color: #fff; }
.hint { color: var(--muted); font-size: 13px; margin: 8px 0 0; }
.copytext { margin-top: 12px; border-top: 1px dashed var(--line); padding-top: 12px; overflow-wrap: anywhere; }
.copytext:not(.rich) { white-space: pre-wrap; }
.copytext h2 { font: 600 19px/1.3 var(--body); margin: 18px 0 6px; }
.copytext h3 { font: 600 16px/1.3 var(--body); margin: 14px 0 4px; }
.copytext p { margin: 0 0 10px; }
.copytext blockquote { margin: 0 0 12px; padding-left: 12px; border-left: 3px solid var(--gold); }
.copytext a { color: var(--gold-ink); }
code { font: 13px ui-monospace, Menlo, monospace; background: var(--bg); padding: 1px 5px; border-radius: 4px; }
.card img { display: block; margin-top: 12px; border-radius: 6px; border: 1px solid var(--line); max-width: 100%; }
.alt { margin-top: 10px; display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; align-items: center; }
.alt .label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); font-weight: 600; }
.alt .copytext { grid-column: 1 / -1; margin: 0; border: 0; padding: 0; font-size: 14px; }
.toast { position: fixed; left: 50%; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);
  background: var(--fg); color: var(--bg); padding: 8px 14px; border-radius: 6px; font-weight: 500; }
@media (prefers-reduced-motion: no-preference) { .btn { transition: background .15s, color .15s; } }
</style>
<div class="wrap">
  <div class="top">
    <div class="eyebrow">Patreon handoff · {{COUNT}} steps</div>
    <h1>{{NAME}}</h1>
    <p class="sub">Work down the page: each step is the next thing to paste or upload in Patreon's editor.</p>
  </div>
  <section class="checks"><h2>Before you publish</h2><ul>{{CHECKS}}</ul></section>
  {{CARDS}}
</div>
<div class="toast" id="toast" hidden></div>
<script>
const toast = (msg) => { const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 1800); };
const flash = (btn, label) => { const old = btn.textContent; btn.textContent = label; btn.classList.add('done');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1500); };
const selectEl = (el) => { const r = document.createRange(); r.selectNodeContents(el);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r); };

document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  const el = document.getElementById(btn.dataset.copy);
  const plain = el.dataset.md, rich = el.classList.contains('rich');
  try {
    if (rich && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([el.innerHTML], {type: 'text/html'}),
        'text/plain': new Blob([plain], {type: 'text/plain'})})]);
    } else { await navigator.clipboard.writeText(plain); }
    flash(btn, 'Copied');
  } catch (e) { selectEl(el); toast('Selected: press Ctrl/Cmd+C to copy'); }
}));

const pngBlob = (img) => new Promise((res, rej) => { const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0);
  c.toBlob(b => b ? res(b) : rej(new Error('no blob')), 'image/png'); });

document.querySelectorAll('[data-img]').forEach(btn => btn.addEventListener('click', async () => {
  const img = document.getElementById(btn.dataset.img);
  try {
    if (!window.ClipboardItem) throw new Error('no clipboard');
    await navigator.clipboard.write([new ClipboardItem({'image/png': pngBlob(img)})]);
    flash(btn, 'Copied');
  } catch (e) { toast('Copy not allowed here: right-click or long-press the image to save it'); }
}));

(async () => {
  const downloads = await window.claude?.use?.('downloads');
  if (!downloads) return;
  document.querySelectorAll('[data-save]').forEach(btn => {
    btn.hidden = false;
    btn.addEventListener('click', async () => {
      const img = document.getElementById(btn.dataset.save);
      try {
        const blob = await (await fetch(img.src)).blob();
        await downloads.save({filename: btn.dataset.name, data: blob});
        flash(btn, 'Saved');
      } catch (e) {
        if (e && e.code === 'declined') return;
        if (e && ['unavailable', 'not_granted', 'capability_disabled', 'capability_removed'].includes(e.code)) {
          document.querySelectorAll('[data-save]').forEach(b => b.hidden = true);
        }
        toast(e && e.code === 'rate_limited' ? 'A save is already open, try again in a moment' : 'Couldn’t save: right-click or long-press the image instead');
      }
    });
  });
})();

document.querySelectorAll('.checks input').forEach(cb => {
  const key = location.pathname + ':' + cb.id;
  try { cb.checked = localStorage.getItem(key) === '1'; } catch (e) {}
  cb.addEventListener('change', () => { try { localStorage.setItem(key, cb.checked ? '1' : '0'); } catch (e) {} });
});
</script>
"""

if __name__ == "__main__":
    main()
