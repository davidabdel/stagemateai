Claude Code IDE Integration Setup for Windsurf
Prerequisites

Claude Code CLI installed (you already have this in WSL)
Windsurf IDE running
Your project open in Windsurf

Step-by-Step Setup Instructions
1. Open Windsurf's Integrated Terminal
Important: You must use Windsurf's built-in terminal, NOT an external terminal.

Press `Ctrl + `` (backtick) to open the integrated terminal
Or go to: View → Terminal

2. Switch to WSL Terminal in Windsurf
Since you have Claude installed in WSL:

In the terminal panel, click the dropdown arrow (∨) next to the + icon
Select "WSL" or "Ubuntu" (or your specific WSL distribution)
You should now be in a WSL terminal within Windsurf

3. Navigate to Your Project Directory
bashcd /mnt/c/Users/User/stagemateai
4. Run Claude from the Integrated Terminal
bashclaude
Note: Running Claude from Windsurf's integrated terminal is crucial for IDE detection.
5. Enable IDE Integration
Once Claude is running, try one of these:

Type /ide and press Enter
If a menu appears, select "VSCode" or "Windsurf"

6. Test the Integration
If successful, you should be able to:

Use Cmd+Esc (Mac) or Ctrl+Esc (Windows/Linux) to open Claude Code directly
See code changes in Windsurf's diff viewer
Use Alt+Ctrl+K (Windows/Linux) to insert file references