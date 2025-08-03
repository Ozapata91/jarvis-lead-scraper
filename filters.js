// 📁 filters.js

export default function filterJarvisLeads(leads) {
  return leads.filter(lead => lead.rank > 10);
}
