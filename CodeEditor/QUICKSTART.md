# Quick Start Guide

Get your AI Code Editor up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.11 or higher (`python --version`)
- ✅ Node.js 18 or higher (`node --version`)
- ✅ A Groq API key (free at [console.groq.com](https://console.groq.com))

## Step 1: Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (you'll need it in Step 3)

## Step 2: Install Dependencies

### Option A: Windows (Using .bat files)

```bash
# Open Command Prompt or PowerShell in the project directory

# Start backend (will install dependencies automatically)
start_backend.bat

# In a new terminal, start frontend
start_frontend.bat
```

### Option B: macOS/Linux (Using .sh files)

```bash
# Make scripts executable
chmod +x start_backend.sh start_frontend.sh

# Start backend (will install dependencies automatically)
./start_backend.sh

# In a new terminal, start frontend
./start_frontend.sh
```

### Option C: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

## Step 3: Configure Your API Key

During the first run of `start_backend`, a `.env` file will be created.

Edit `backend/.env` and add your Groq API key:

```env
GROQ_API_KEY=your_actual_api_key_here
```

## Step 4: Start the Application

### Backend
```bash
cd backend
python main.py
```
Backend will run on: `http://localhost:8000`

### Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

## Step 5: Try It Out!

1. Open `http://localhost:5173` in your browser
2. You'll see the AI Code Editor interface
3. Try these example prompts:

### Example 1: Simple Todo App
```
Create a modern todo app with React. Include add, delete, and toggle complete features. Use a clean, dark UI with smooth animations.
```

### Example 2: Landing Page
```
Build a product landing page with a hero section, features grid, and contact form. Make it responsive and modern looking.
```

### Example 3: Next.js Blog
```
Create a blog using Next.js with a homepage showing recent posts, individual post pages, and a clean typography-focused design.
```

## What to Expect

1. **Idea Stage** (~10-15 seconds): AI analyzes your request and creates a project specification
2. **Planning Stage** (~10-15 seconds): AI designs the file structure and implementation plan
3. **Coding Stage** (~30-60 seconds): AI generates all code files one by one
4. **Building Stage** (~30-90 seconds): Dependencies are installed and project is built
5. **Complete**: Your application appears in the live preview pane!

## Troubleshooting

### "GROQ_API_KEY not found"
- Make sure you edited `backend/.env` with your actual API key
- Restart the backend server after adding the key

### Backend won't start
```bash
# Try reinstalling dependencies
cd backend
pip install --upgrade -r requirements.txt
```

### Frontend won't start
```bash
# Try deleting node_modules and reinstalling
cd frontend
rm -rf node_modules  # macOS/Linux
# or
rmdir /s node_modules  # Windows

npm install
```

### Build fails
- Ensure Node.js and npm are in your system PATH
- Check that ports 8000-9000 are available
- Try running a simple npm project manually to verify your Node.js setup

### WebSocket connection errors
- Check that both backend and frontend are running
- Verify no firewall is blocking localhost connections
- Make sure ports 8000 and 5173 are not in use by other applications

## Tips for Best Results

1. **Be Specific**: The more details you provide, the better the output
   - ❌ "Create a website"
   - ✅ "Create a portfolio website with a hero section, about me page, project gallery, and contact form. Use a minimalist design with animations."

2. **Start Simple**: Begin with smaller projects to understand the system
   
3. **Iterate**: Use the "Regenerate" button to refine your project with additional requirements

4. **Check the Logs**: Both terminal windows show useful information if something goes wrong

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the codebase to understand the multi-agent system
- Customize the UI in `frontend/src/components/`
- Adjust AI prompts in `backend/agents/` for different outputs

## Getting Help

If you encounter issues:
1. Check the terminal logs for error messages
2. Verify all prerequisites are met
3. Ensure your Groq API key is valid
4. Try the troubleshooting steps above

## API Rate Limits

Free Groq accounts have rate limits:
- ~30 requests per minute
- ~14,400 requests per day

If you hit limits, wait a minute and try again, or upgrade your Groq account.

---

**Enjoy building with AI! 🚀**

