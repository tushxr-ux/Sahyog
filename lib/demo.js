// Demo data: realistic Mumbai donors, NGO needs, citizen contributions, and impact history.
// All data is clearly labelled as demo/simulation.

export const DEMO_IMPACT = {
  mealsRescued:  12840,
  needsFulfilled: 426,
  ngosSupported:  84,
  peopleReached: 19300,
};

export const DEMO_USER = {
  name: "Tushar Salunkhe",
  mealsSupported: 1240,
  needsFulfilled: 18,
  contributed: 12500,
  itemsDonated: 37,
};

export const NGO_NEEDS = [
  { id: 1, ngoName: "Child Vision and Education", category: "Education",    item: "School Bags",   qty: 25, priority: "high",   area: "Dahisar",     deadline: "Oct 15" },
  { id: 2, ngoName: "Community Outreach Programme", category: "Shelter",   item: "Blankets",      qty: 20, priority: "critical", area: "Mumbai Central", deadline: "Tonight" },
  { id: 3, ngoName: "SUPPORT (Ansh Community Kitchen)", category: "Food",   item: "Rice (kg)",     qty: 30, priority: "high",   area: "Santacruz",   deadline: "Tomorrow" },
  { id: 4, ngoName: "Tweet Foundation",           category: "Clothes",      item: "Winter Jackets", qty: 15, priority: "medium", area: "Goregaon",    deadline: "Oct 20" },
  { id: 5, ngoName: "Bal Asha Trust",             category: "Education",    item: "Notebooks",     qty: 100, priority: "medium", area: "Mahalakshmi", deadline: "Oct 18" },
  { id: 6, ngoName: "Prayatna",                   category: "Essentials",   item: "Sanitary Pads", qty: 50, priority: "high",   area: "Malad",       deadline: "Oct 12" },
];

export const CONTRIBUTION_HISTORY = [
  { id: 1, date: "Sep 28, 2026", type: "Food Rescue", ngo: "Sadadevi Foundation",   status: "Completed", meals: 80 },
  { id: 2, date: "Sep 20, 2026", type: "Item Donation", ngo: "Child Vision and Education", status: "Received", item: "12 School Bags" },
  { id: 3, date: "Sep 15, 2026", type: "Donation",    ngo: "SUPPORT",               status: "Received", amount: 500 },
  { id: 4, date: "Sep 8, 2026",  type: "Food Rescue", ngo: "Prayatna",              status: "Completed", meals: 150 },
  { id: 5, date: "Aug 30, 2026", type: "Item Donation", ngo: "Bal Asha Trust",      status: "Received", item: "10 Notebooks" },
];

export const ITEM_CATEGORIES = [
  { id: "food",       label: "Food",            icon: "🥘", count: 3 },
  { id: "clothes",    label: "Clothes",          icon: "👕", count: 2 },
  { id: "books",      label: "Books",            icon: "📚", count: 1 },
  { id: "school",     label: "School Supplies",  icon: "🎒", count: 4 },
  { id: "blankets",   label: "Blankets",         icon: "🛌", count: 2 },
  { id: "toys",       label: "Toys",             icon: "🧸", count: 1 },
  { id: "essentials", label: "Essentials",       icon: "🧴", count: 3 },
  { id: "other",      label: "Other",            icon: "📦", count: 0 },
];

export const PRIORITY_COLOR = {
  critical: "danger",
  high:     "high",
  medium:   "medium",
};
