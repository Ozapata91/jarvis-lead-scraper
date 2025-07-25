// 📁 filters.js

function filterJarvisLeads(leads) {
  return leads.filter(lead =>
    lead.rank <= 10 &&
    lead.website
  );
}

module.exports = filterJarvisLeads;
