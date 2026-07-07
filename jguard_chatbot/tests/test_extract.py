import pytest

from app.extract import extract_text_from_file


def test_unsupported_extension(tmp_path):
    target = tmp_path / "sample.txt"
    target.write_text("hello", encoding="utf-8")
    with pytest.raises(ValueError):
        extract_text_from_file(str(target))


def test_docx_extraction(tmp_path):
    docx = pytest.importorskip("docx")
    target = tmp_path / "sample.docx"
    document = docx.Document()
    document.add_paragraph("전세 계약서 샘플")
    document.add_paragraph("보증금 1억원")
    document.save(str(target))

    text = extract_text_from_file(str(target))
    assert "전세 계약서 샘플" in text
    assert "보증금 1억원" in text
