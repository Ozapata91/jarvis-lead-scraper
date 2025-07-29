// 📁 agent_enrich.js

import guessOwnerName from "./owner_guess.js";
import generateAudit from "./audit.js";

export default async function enrichAll(leads) {
  const enriched = [];

  for (const lead of leads) {
    const result = { ...lead };

    try {
      result.ownerGuess = await guessOwnerName(result.name);
    } catch {
      result.ownerGuess = "Not Found";
    }

    try {
      result.auditBlurb = await generateAudit(result);
    } catch {
      result.auditBlurb = "Visibility audit not available.";
    }

    result.auditSummary = result.auditBlurb;
    result.emailStatus = "missing";
    result.emailBody = "no";
    result.hasWebsite = result.website && result.website !== "" ? "yes" : "no";
    result.claimStatus = result.claimStatus || "missing";
    result.reviewStatus = result.reviewStatus || "missing";

    enriched.push(result);
  }

  return enriched;
}
