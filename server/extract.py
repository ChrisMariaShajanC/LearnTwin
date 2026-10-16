import json
import os
import re
import sys
import zipfile

path = sys.argv[1]
extension = os.path.splitext(path)[1].lower()
result = {"text": "", "pages": 0, "error": None}

try:
    if extension == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(path)
        pages = []
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        result["text"] = "\n\n".join(pages).strip()
        result["pages"] = len(pages)
    elif extension == ".docx":
        with zipfile.ZipFile(path) as archive:
            xml = archive.read("word/document.xml").decode("utf-8", "ignore")
        xml = xml.replace("<w:br/>", "\n").replace("<w:br />", "\n")
        xml = re.sub(r"</w:p>", "\n", xml)
        xml = re.sub(r"<[^>]+>", "", xml)
        result["text"] = re.sub(r"\n{3,}", "\n\n", xml).strip()
        result["pages"] = max(1, len(result["text"]) // 2500)
    elif extension in (".txt", ".csv", ".md"):
        with open(path, "r", encoding="utf-8", errors="ignore") as handle:
            result["text"] = handle.read().strip()
        result["pages"] = max(1, len(result["text"]) // 2500)
    else:
        result["error"] = f"Unsupported file type: {extension}"
except Exception as exc:  # noqa: BLE001
    result["error"] = str(exc)

print(json.dumps(result, ensure_ascii=False))
