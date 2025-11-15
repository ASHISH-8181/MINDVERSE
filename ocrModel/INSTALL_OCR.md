Windows setup for OCR and summarizer (local)

This file lists the system dependencies and Python packages needed to run the OCR and summarizer scripts in `ocrModel/`.

1) Install Python
- Install Python 3.10+ from https://www.python.org/downloads/windows/
- Make sure to check "Add Python to PATH" during installer.

2) Install Tesseract OCR (system binary)
- Download and install (Windows) from: https://github.com/UB-Mannheim/tesseract/wiki
- After install, ensure the `tesseract` executable is on your PATH. Test with:

```powershell
tesseract --version
```

3) Install Poppler (required by `pdf2image`)
- Download Poppler for Windows from https://blog.alivate.com.au/poppler-windows/ or https://github.com/oschwartz10612/poppler-windows
- Unzip and add the `bin` folder to your PATH. Test by running `pdftoppm -h`.

4) Create a Python virtual environment and install packages
Open PowerShell in `hackagra/ocrModel` and run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements-ocr.txt
```

If you want the summarizer (Mistral) support, install ML packages:

```powershell
# CPU-only PyTorch (example):
pip install --index-url https://download.pytorch.org/whl/cpu torch
# then install ML packages
pip install -r requirements-ml.txt
```

Notes and troubleshooting
- `pytesseract` is a Python wrapper for the Tesseract binary; it requires the system `tesseract` binary.
- `pdf2image` requires Poppler's `pdftoppm`.
- `llama-cpp-python` may require a C/C++ toolchain or prebuilt wheels; check its docs: https://github.com/abetlen/llama-cpp-python
- Installing `torch` on Windows is easiest with the wheel index from PyTorch (see https://pytorch.org/get-started/locally/).

5) Test OCR script
With the venv active:

```powershell
python tesseract_ocr.py ..\backend\temp_files\Screenshot\ (1).png
```

Or test the PDF OCR:

```powershell
python pdf_ocr.py ..\path\to\sample.pdf
```

If you want, I can attempt to run the above steps here (create the venv and run pip). If you want me to automate more (e.g., add an npm script to run the Python setup), say so.
