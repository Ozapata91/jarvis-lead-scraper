// 📁 agent_runner.js

import { runAgentSweep } from "./sheets_agent.js";

(async () => {
  console.log("🔁 Starting AI Agent Sweep...");
  await runAgentSweep();
  console.log("✅ Agent task complete. All needy leads updated.");
})();
