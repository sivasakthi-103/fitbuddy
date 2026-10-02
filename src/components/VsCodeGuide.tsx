import React, { useState } from "react";
import { Terminal, Copy, Check, Code, Play, FolderTree, BookOpen, ExternalLink } from "lucide-react";

export const VsCodeGuide: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const steps = [
    {
      id: "step1",
      title: "Step 1: Open Project in VS Code & Create Virtual Environment",
      description:
        "Open VS Code in the project folder and configure a dedicated virtual environment.",
      bash: `# 1. Open VS Code in project root directory
code .

# 2. Open integrated terminal (Ctrl+\` or Cmd+\`)
# Create Python virtual environment
python -m venv fitbuddy-env

# 3. Activate virtual environment
# Windows (PowerShell):
fitbuddy-env\\Scripts\\activate
# Windows (Git Bash):
source fitbuddy-env/Scripts/activate
# macOS / Linux:
source fitbuddy-env/bin/activate`,
    },
    {
      id: "step2",
      title: "Step 2: Install Python Dependencies",
      description:
        "Install FastAPI, Uvicorn, SQLAlchemy, Google GenAI SDK, and template dependencies.",
      bash: `# Ensure pip is upgraded
pip install --upgrade pip

# Install all required dependencies
pip install -r requirements.txt

# Or install manually:
pip install fastapi "uvicorn[standard]" jinja2 sqlalchemy python-multipart google-genai python-dotenv pydantic`,
    },
    {
      id: "step3",
      title: "Step 3: Configure Environment Variables (.env)",
      description:
        "Add your Gemini API Key in the root .env file.",
      bash: `# Create .env in the project root:
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
DATABASE_URL="sqlite:///./fitbuddy.db"`,
    },
    {
      id: "step4",
      title: "Step 4: Launch the FastAPI Application",
      description:
        "Run the Uvicorn ASGI server with hot reloading enabled.",
      bash: `# Launch FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000

# Server will be running at:
# 🌐 Web UI: http://127.0.0.1:8000
# 📚 Interactive Swagger Docs: http://127.0.0.1:8000/docs
# 📖 Alternative Redoc: http://127.0.0.1:8000/redoc`,
    },
    {
      id: "step5",
      title: "Step 5: Testing Endpoints with cURL",
      description:
        "Quick terminal commands to verify the endpoints directly.",
      bash: `# 1. Generate 7-Day Workout & Nutrition Tip
curl -X POST http://127.0.0.1:8000/generate-workout \\
  -F "username=Marcus Vance" \\
  -F "user_id=marcus_v" \\
  -F "age=29" \\
  -F "weight=80" \\
  -F "goal=muscle_gain" \\
  -F "intensity=high"

# 2. Submit Feedback to Revise Plan
curl -X POST http://127.0.0.1:8000/submit-feedback \\
  -F "user_id=marcus_v" \\
  -F "feedback=Please add a 15-minute HIIT cardio finisher on upper body days."

# 3. View All Registered Users (Admin View)
curl http://127.0.0.1:8000/view-all-users`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Terminal className="w-4 h-4" />
          <span>Local Deployment & Developer Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          VS Code Setup & FastAPI Running Guide
        </h1>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed">
          The FitBuddy codebase includes both the interactive TypeScript/Express web application
          and the complete native <strong>Python FastAPI + SQLite + Jinja2</strong> codebase
          located in <code className="text-emerald-400">/app</code>, <code className="text-emerald-400">/templates</code>, and <code className="text-emerald-400">/static</code>.
        </p>
      </div>

      {/* Project Structure Overview */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          <FolderTree className="w-4 h-4 text-emerald-400" />
          <span>Complete File Tree & Architecture</span>
        </div>
        <div className="bg-[#090d18] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre>{`fitbuddy-project/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI entry point & app configuration
│   ├── routes.py                   # Route handlers (/, /generate-workout, /submit-feedback, /view-all-users)
│   ├── gemini_generator.py         # 7-day workout plan generation via Google Gemini
│   ├── gemini_flash_generator.py   # Goal-specific nutrition tips via Gemini Flash
│   ├── updated_plan.py             # Feedback-based plan revision loop
│   ├── database.py                 # SQLite engine & SQLAlchemy helper methods
│   ├── models.py                   # User & Plan SQLAlchemy ORM models
│   └── schemas.py                  # Pydantic validation schemas (UserInput, FeedbackRequest)
├── templates/
│   ├── index.html                  # Jinja2 user input form
│   ├── result.html                 # Jinja2 plan, nutrition tip, and feedback revision UI
│   └── all_users.html              # Jinja2 coach admin dashboard
├── static/
│   └── css/
│       └── style.css               # Gym-themed athletic stylesheet
├── server.ts                       # Express + Gemini TypeScript full-stack server
├── src/                            # React 19 interactive frontend
├── requirements.txt                # Python dependencies
└── README.md                       # Comprehensive setup documentation`}</pre>
        </div>
      </div>

      {/* Step by Step Execution */}
      <div className="space-y-4">
        {steps.map((s, index) => (
          <div
            key={s.id}
            className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Milestone 5 • {s.title.split(":")[0]}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {s.title.split(":")[1] || s.title}
                </h3>
              </div>
              <button
                onClick={() => copyCode(s.bash, s.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copiedId === s.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === s.id ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mb-4">{s.description}</p>
            <div className="bg-[#090d18] border border-slate-800 rounded-xl p-4 overflow-x-auto">
              <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed">
                {s.bash}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Milestone Mapping Summary Card */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Implemented Milestones Checklist</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#131b2e] border border-slate-700/60">
            <span className="font-bold text-emerald-400 block mb-1">
              ✓ Milestone 1: Model Selection & Architecture
            </span>
            <p className="text-slate-300">
              Integrated Google Gemini models for structured 7-day periodization and lightweight Gemini Flash for lightning-fast nutrition advice.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#131b2e] border border-slate-700/60">
            <span className="font-bold text-emerald-400 block mb-1">
              ✓ Milestone 2: Core Functionalities
            </span>
            <p className="text-slate-300">
              Workout plan generation, nutrition tip generation, feedback revision loop, and SQLite persistence.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#131b2e] border border-slate-700/60">
            <span className="font-bold text-emerald-400 block mb-1">
              ✓ Milestone 3: Route Handling
            </span>
            <p className="text-slate-300">
              Configured <code className="text-slate-200">/generate-workout</code>, <code className="text-slate-200">/submit-feedback</code>, and <code className="text-slate-200">/view-all-users</code>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#131b2e] border border-slate-700/60">
            <span className="font-bold text-emerald-400 block mb-1">
              ✓ Milestone 4 & 5: UI & Deployment
            </span>
            <p className="text-slate-300">
              Jinja2 dynamic templates + responsive modern React SPA + full documentation for local execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
