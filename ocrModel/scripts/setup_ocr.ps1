<#
PowerShell helper to create a venv and install OCR Python packages.
This does NOT install system packages (Tesseract, Poppler) — see INSTALL_OCR.md
#>
param(
  [string]$venvPath = ".venv",
  [switch]$InstallML
)

Write-Host "Creating virtual environment at: $venvPath"
python -m venv $venvPath

Write-Host "Activating venv and installing packages..."
$activate = Join-Path $venvPath 'Scripts\Activate.ps1'
if (-Not (Test-Path $activate)) {
  Write-Error "Activation script not found. Is Python installed and in PATH?"
  exit 1
}

& $activate

pip install --upgrade pip
pip install -r ..\requirements-ocr.txt

if ($InstallML) {
  Write-Host "Installing ML requirements (transformers, llama-cpp-python). You may need to install torch separately depending on your system."
  pip install -r ..\requirements-ml.txt
  Write-Host "If you need a CPU-only torch wheel, run:"
  Write-Host "  pip install --index-url https://download.pytorch.org/whl/cpu torch"
}

Write-Host "Done. To activate the environment later run: .\\$venvPath\\Scripts\\Activate.ps1"
