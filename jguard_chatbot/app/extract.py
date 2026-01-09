import os

import fitz
from docx import Document


def extract_text_from_file(file_path: str) -> str:
    """PDF 또는 DOCX 파일에서 텍스트를 추출한다."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        doc = fitz.open(file_path)
        try:
            return "\n".join(page.get_text() for page in doc)
        finally:
            doc.close()
    elif ext == ".docx":
        doc = Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    raise ValueError("지원하지 않는 파일 형식입니다. PDF 또는 DOCX만 허용됩니다.")
