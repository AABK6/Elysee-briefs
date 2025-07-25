#!/usr/bin/env python3
"""
extract_memo_info.py
====================

This script scans a directory for Microsoft Word (``.doc``/``.docx``) and
PDF (``.pdf``) memo files, extracts the text from each document, and then
calls Google’s Gemini 2.5 Flash‑Lite model via the official Gen AI SDK to
identify key metadata from the memo.  For each memo the script requests
the following pieces of information from the model:

* ``titre_fr`` – the full title of the memo in French (the original
  language),
* ``titre_en`` – the title translated into English,
* ``auteur`` – the author of the memo, and
* ``resume_fr`` / ``resume_en`` – a one–sentence summary of the memo’s
  content in French and English respectively.

The script expects your Gemini API key to be available through the
``GEMINI_API_KEY`` environment variable.  This follows the official
quick‑start guidance, where the Python client obtains the API key from
``GEMINI_API_KEY`` and then constructs a ``Client`` instance to make
requests to the service【643587506422669†L330-L344】.  The stable model code
for Gemini 2.5 Flash‑Lite is ``gemini-2.5-flash-lite``, which is
documented as a cost‑efficient model for high‑throughput tasks and
supports input types including text, images, video, audio and PDF
documents【896886523630561†L516-L599】.

Text extraction is handled with a flexible strategy.  If available,
``textract`` is used to process Word and PDF files with a single line of
code—calling ``textract.process(filename)`` returns the document’s text
as a byte string【423626353600970†L21-L35】.  Should ``textract`` not be
installed or fail on a particular file, the script falls back to
specialised parsers: ``docx2python`` can extract all text from a
``.docx`` file using ``docx2python('file.docx').text``【961472413583295†L21-L74】;
for legacy ``.doc`` or ``.docx`` formats the commercial
``Spire.Doc`` library (installed separately via ``pip install
Spire.Doc``) can load a Word file and return its text with
``Document.GetText()``【408814474616832†L58-L98】; and PDF files are
handled by ``PyPDF2`` by iterating through each page and calling
``page.extract_text()``【907390004193858†L76-L84】.

Usage
-----

Run the script with the directory containing your memos:

```
python3 extract_memo_info.py /path/to/memo/directory
```

The script outputs a JSON array to ``stdout`` where each element
contains the extracted metadata and the original file path.
"""

import argparse
import json
import logging
import os
from typing import Any, Dict, List, Optional

try:
    # Import the new Google Gen AI SDK.  This module is provided by the
    # ``google-genai`` package, which should be installed with
    # ``pip install google-genai``【821741255240569†L274-L285】.
    from google import genai
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        "The 'google-genai' package is required. Install it with 'pip install google-genai'."
    ) from exc


def extract_text(file_path: str) -> str:
    """Extract the textual content from a Word or PDF document.

    This function tries multiple libraries in order of preference.  It
    first attempts to use ``textract`` for broad format support
    (including ``.doc``, ``.docx`` and ``.pdf``).  If that fails or
    ``textract`` isn't installed, specialised fallbacks are used.

    Parameters
    ----------
    file_path : str
        The absolute path to the document file.

    Returns
    -------
    str
        The extracted text as a Unicode string.
    """
    ext = os.path.splitext(file_path)[1].lower().lstrip('.')

    # First try textract, which supports many document types via a single call.
    try:
        import textract  # type: ignore

        text_bytes = textract.process(file_path)
        return text_bytes.decode('utf-8', errors='replace')
    except Exception:
        pass  # fall back to specific handlers if textract isn't available or fails

    if ext == 'pdf':
        # Fallback for PDF: PyPDF2
        try:
            from PyPDF2 import PdfReader  # type: ignore

            reader = PdfReader(file_path)
            text_parts: List[str] = []
            for page in reader.pages:
                page_text = page.extract_text()  # returns None if no text
                if page_text:
                    text_parts.append(page_text)
            return '\n'.join(text_parts)
        except Exception as pdf_exc:
            raise RuntimeError(f"Could not extract text from PDF '{file_path}': {pdf_exc}")

    if ext == 'docx':
        # Fallback for DOCX: docx2python
        try:
            from docx2python import docx2python  # type: ignore

            doc = docx2python(file_path)
            return doc.text
        except Exception:
            pass  # try spire as a last resort

    if ext in {"doc", "docx"}:
        # Attempt using Spire.Doc for both .doc and .docx files
        try:
            from spire.doc import Document  # type: ignore

            document = Document()
            document.LoadFromFile(file_path)
            content = document.GetText()
            document.Close()
            return content
        except Exception as doc_exc:
            raise RuntimeError(f"Could not extract text from Word file '{file_path}': {doc_exc}")

    raise RuntimeError(f"Unsupported file type for '{file_path}'.")


def call_gemini(client: genai.Client, content: str) -> Dict[str, Any]:
    """Send a memo's text to Gemini 2.5 Flash and parse the JSON response.

    The prompt is written in French to emphasise that the input memo is in
    French.  It instructs the model to return a JSON object with clearly
    named keys.  If the response cannot be parsed as JSON, the raw
    response is returned under the ``raw_response`` key.

    Parameters
    ----------
    client : genai.Client
        An authenticated Gen AI client.
    content : str
        The full text of the memo to analyse.

    Returns
    -------
    Dict[str, Any]
        Parsed information from the model or a dictionary containing the
        raw response text if JSON parsing fails.
    """
    # Compose the prompt in French to encourage the model to extract French
    # metadata and provide translations.  The prompt explicitly asks for
    # JSON output to simplify parsing.
    prompt = (
        """
        You are an expert assistant specialized in analyzing official documents.
        Based on the following text from a memo, extract the requested information and provide it in a clean JSON format.

        The JSON object must contain the following keys exactly: title_fr, title_en, author, summary_fr, summary_en.

        - title_fr: The full, original title of the memo in French.
        - title_en: The accurate English translation of the full French title.
        - author: The name of the author(s). If not found, use 'Non trouvé'.
        - summary_fr: A single, concise sentence in French summarizing the main point of the memo.
        - summary_en: An accurate English translation of the French summary.

        If any piece of information cannot be found in the text, use 'Information non disponible' for that specific field.
        Do not add any text or markdown formatting before or after the JSON object.
        
        Voici le contenu de la note:\n\n
        """
    ) + content

    # Send the prompt to the Gemini API using the Flash‑Lite model.  The
    # quick‑start example shows calling ``client.models.generate_content``
    # with the model name and content【643587506422669†L330-L344】.  We use
    # ``gemini-2.5-flash-lite`` for cost‑efficient, high‑throughput
    # processing【896886523630561†L516-L599】.
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    raw_text = response.text.strip()
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        return {"raw_response": raw_text}


def process_directory(
    directory: str,
    num_files: Optional[int] = None,
    create_pdf: bool = False,
) -> List[Dict[str, Any]]:
    """Process supported memo files in a directory, optionally converting to PDF.

    Parameters
    ----------
    directory : str
        The root directory to scan.
    num_files : int, optional
        The maximum number of files to process. If None, all files are
        processed.
    create_pdf : bool
        If True, create a PDF copy of any non-PDF documents.

    Returns
    -------
    List[Dict[str, Any]]
        A list of dictionaries containing extracted information for each file.
    """
    results: List[Dict[str, Any]] = []

    # Create the Gen AI client; it picks up the API key from the
    # GEMINI_API_KEY environment variable【643587506422669†L330-L344】.
    client = genai.Client()

    all_file_paths = []
    for root, _dirs, files in os.walk(directory):
        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            if ext in {'.doc', '.docx', '.pdf'}:
                all_file_paths.append(os.path.join(root, filename))

    all_file_paths.sort()

    files_to_process = (
        all_file_paths[:num_files] if num_files is not None else all_file_paths
    )

    for file_path in files_to_process:
        ext = os.path.splitext(file_path)[1].lower()
        if create_pdf and ext in {'.doc', '.docx'}:
            pdf_path = os.path.splitext(file_path)[0] + '.pdf'
            if not os.path.exists(pdf_path):
                logging.info("Converting %s to PDF...", file_path)
                try:
                    from spire.doc import Document, FileFormat  # type: ignore

                    document = Document()
                    document.LoadFromFile(file_path)
                    document.SaveToFile(pdf_path, FileFormat.PDF)
                    document.Close()
                    logging.info("Successfully created PDF at %s", pdf_path)
                except Exception as e:
                    logging.error("Failed to convert %s to PDF: %s", file_path, e)

        logging.info("Processing %s", file_path)
        try:
            text = extract_text(file_path)
            info = call_gemini(client, text)
            info['file'] = file_path
            results.append(info)
        except Exception as exc:
            logging.error("Failed to process %s: %s", file_path, exc)
    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Scan a directory for Word and PDF memos, extract their text "
            "and use Gemini 2.5 Flash‑Lite to pull out titles, authors and summaries."
        )
    )
    parser.add_argument(
        "directory",
        help="Path to the directory containing memo files (.doc, .docx, .pdf)",
    )
    parser.add_argument(
        "-n",
        "--num-files",
        type=int,
        default=None,
        help="The maximum number of memo files to process.",
    )
    parser.add_argument(
        "--create-pdf",
        action="store_true",
        help="Create a PDF copy of any non-PDF documents.",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Optional path to write the resulting JSON data. If omitted, the results are printed to stdout.",
    )
    args = parser.parse_args()

    results = process_directory(
        args.directory, num_files=args.num_files, create_pdf=args.create_pdf
    )
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
    else:
        with open('memo_data.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()