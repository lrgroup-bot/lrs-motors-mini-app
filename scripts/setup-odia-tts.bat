@echo off
setlocal
cd /d "%~dp0.."
echo ==========================================
echo LRS Motors - Free Odia Female TTS Setup
echo ==========================================
python --version || goto :python_error
python -m venv .venv-odia
call .venv-odia\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
python -m pip install transformers soundfile sentencepiece protobuf
python -m pip install git+https://github.com/huggingface/parler-tts.git
if errorlevel 1 goto :install_error
echo.
echo Setup completed.
echo Testing Odia female voice Debjani...
python scripts\odia-tts.py --speaker Debjani --text "ଏଲ୍ ଆର୍ ଏସ୍ ମୋଟର୍ସକୁ ସ୍ୱାଗତ। ଆମ ପାଖରେ ଭଲ ଗାଡ଼ି ଉପଲବ୍ଧ ଅଛି।" --out data\odia-test.wav
if errorlevel 1 goto :test_error
echo.
echo SUCCESS: data\odia-test.wav created.
echo Run: start data\odia-test.wav
echo For the marketing worker use:
echo set LRS_PYTHON=%CD%\.venv-odia\Scripts\python.exe
echo npm run marketing-worker
goto :end
:python_error
echo Python was not found. Install Python 3.10/3.11 and retry.
goto :end
:install_error
echo TTS dependency installation failed. Copy the error shown above.
goto :end
:test_error
echo TTS test failed. Copy the error shown above.
:end
endlocal
