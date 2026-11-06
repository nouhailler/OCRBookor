"""
OCRBookor - Générateur EPUB 3 Strict
Produit des archives EPUB 3 conformes IDPF sans dépendance externe obligatoire.
"""

import zipfile
import html
import io
from pathlib import Path
from typing import Dict, Any, List

class EPUBExporter:
    @staticmethod
    def generate_epub(
        project_data: Dict[str, Any],
        output_path: Path
    ) -> bool:
        meta = project_data.get("metadata", {})
        title = html.escape(meta.get("title", "Livre sans titre"))
        author = html.escape(meta.get("author", "Auteur inconnu"))
        lang = meta.get("language", "fra")
        book_id = meta.get("isbn") or f"urn:uuid:{project_data.get('id', 'book-001')}"

        chapters = project_data.get("chapters", [])
        if not chapters:
            chapters = [{
                "title": "Texte intégral",
                "blocks": [{"text": p.get("raw_text", "")} for p in project_data.get("pages", [])]
            }]

        with zipfile.ZipFile(output_path, "w") as zf:
            # 1. mimetype MUST be first and NOT compressed
            zf.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)

            # 2. META-INF/container.xml
            container_xml = """<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>"""
            zf.writestr("META-INF/container.xml", container_xml, compress_type=zipfile.ZIP_DEFLATED)

            # 3. OEBPS/styles.css
            css_content = """@charset "utf-8";
body {
  margin: 5% 8%;
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 1.05em;
  line-height: 1.6;
  text-align: justify;
}
h1 { font-size: 1.8em; text-align: center; margin-top: 2em; margin-bottom: 1em; }
h2 { font-size: 1.4em; text-align: center; margin-top: 1.5em; }
p { margin: 0 0 0.3em 0; text-indent: 1.5em; }
p.dialogue { text-indent: 0; padding-left: 1em; }
"""
            zf.writestr("OEBPS/styles.css", css_content, compress_type=zipfile.ZIP_DEFLATED)

            # 4. Chapters XHTML
            manifest_items = []
            spine_items = []

            for i, chap in enumerate(chapters):
                filename = f"chapter_{i + 1}.xhtml"
                chap_id = f"chap_{i + 1}"
                chap_title = html.escape(chap.get("title", f"Chapitre {i + 1}"))

                blocks = chap.get("blocks", [])
                body_parts = [f"<h1>{chap_title}</h1>"]
                for b in blocks:
                    t = html.escape(b.get("text", ""))
                    if t:
                        body_parts.append(f"<p>{t}</p>")

                body_content = "\n  ".join(body_parts)
                chap_html = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="{lang}">
<head>
  <meta charset="utf-8" />
  <title>{chap_title}</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  {body_content}
</body>
</html>"""
                zf.writestr(f"OEBPS/{filename}", chap_html, compress_type=zipfile.ZIP_DEFLATED)
                manifest_items.append((chap_id, filename, chap_title))
                spine_items.append(chap_id)

            # 5. OEBPS/nav.xhtml
            nav_entries = "\n      ".join([f'<li><a href="{fn}">{title}</a></li>' for _, fn, title in manifest_items])
            nav_html = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="{lang}">
<head>
  <meta charset="utf-8" />
  <title>Table des Matières</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table des Matières</h1>
    <ol>
      {nav_entries}
    </ol>
  </nav>
</body>
</html>"""
            zf.writestr("OEBPS/nav.xhtml", nav_html, compress_type=zipfile.ZIP_DEFLATED)

            # 6. OEBPS/content.opf
            manifest_xml = "\n    ".join([
                '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
                '<item id="css" href="styles.css" media-type="text/css"/>'
            ] + [f'<item id="{cid}" href="{fn}" media-type="application/xhtml+xml"/>' for cid, fn, _ in manifest_items])

            spine_xml = "\n    ".join([f'<itemref idref="{sid}"/>' for sid in spine_items])

            content_opf = f"""<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">{book_id}</dc:identifier>
    <dc:title>{title}</dc:title>
    <dc:creator>{author}</dc:creator>
    <dc:language>{lang}</dc:language>
  </metadata>
  <manifest>
    {manifest_xml}
  </manifest>
  <spine>
    {spine_xml}
  </spine>
</package>"""
            zf.writestr("OEBPS/content.opf", content_opf, compress_type=zipfile.ZIP_DEFLATED)

        return True
