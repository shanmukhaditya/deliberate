"""
Deliberate: Python / Codex / OpenAI Integration Helper
Allows Python pipelines, Codex tools, and LangChain/OpenAI agents to run Deliberate.
"""

import json
import subprocess
from typing import Dict, Any, Optional, List

class Deliberate:
    """Python bridge to the Deliberate reasoning engine."""
    
    @staticmethod
    def brainstorm(
        goal: str,
        mode: str = "council",
        context: Optional[str] = None,
        constraints: Optional[List[str]] = None,
        provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes deep deliberation and returns the synthesized Pareto blueprint.
        """
        cmd = ["npx", "-y", "deliberate", "brainstorm", goal, "--mode", mode]
        if context:
            cmd.extend(["--context", context])
        if constraints:
            cmd.append("--constraints")
            cmd.extend(constraints)
        if provider:
            cmd.extend(["--provider", provider])
            
        result = subprocess.run(cmd, capture_output=True, text=True)
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }

    @staticmethod
    def red_team(file_path: str, goal: str = "Stress-test invariants") -> Dict[str, Any]:
        """
        Runs adversarial red-teaming against a source file.
        """
        cmd = ["npx", "-y", "deliberate", "red-team", file_path, "--goal", goal]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }

if __name__ == "__main__":
    print("Testing Deliberate Python Bridge...")
    res = Deliberate.brainstorm("Design an in-memory lockless ring buffer", mode="flash", provider="mock")
    print(res["stdout"])
