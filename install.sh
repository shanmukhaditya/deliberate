#!/bin/bash
set -e

echo "⚡ Installing Deliberate for your AI Coding Agents..."

# 1. Antigravity Skill
if [ -d "$HOME/.gemini/antigravity" ]; then
  mkdir -p "$HOME/.gemini/antigravity/skills/deliberate"
  curl -sSL https://raw.githubusercontent.com/shanmukhaditya/deliberate/main/integrations/antigravity/SKILL.md > "$HOME/.gemini/antigravity/skills/deliberate/SKILL.md"
  echo "✔ Google Antigravity Skill installed (~/.gemini/antigravity/skills/deliberate/SKILL.md)"
fi

# 2. Local Project Cursor Rules (if in a git repo)
if [ -d ".git" ]; then
  curl -sSL https://raw.githubusercontent.com/shanmukhaditya/deliberate/main/integrations/cursor/.cursorrules > .cursorrules
  echo "✔ Cursor & Windsurf rules installed (.cursorrules)"
  
  mkdir -p .github
  curl -sSL https://raw.githubusercontent.com/shanmukhaditya/deliberate/main/integrations/antigravity/SKILL.md > .github/copilot-instructions.md
  echo "✔ GitHub Copilot instructions installed (.github/copilot-instructions.md)"
fi

echo ""
echo "🎉 Deliberate is installed and ready! You can now ask your AI agents to 'use deliberate to brainstorm...'."
