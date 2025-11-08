#!/bin/bash
echo "Starting AI Code Editor Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit backend/.env and add your Groq API key!"
    read -p "Press enter to continue..."
fi
echo "Installing/Updating dependencies..."
pip install -r requirements.txt
echo "Starting server..."
python main.py

