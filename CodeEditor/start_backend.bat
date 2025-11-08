@echo off
echo Starting AI Code Editor Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit backend\.env and add your Groq API key!
    pause
)
echo Installing/Updating dependencies...
pip install -r requirements.txt
echo Starting server...
python main.py

