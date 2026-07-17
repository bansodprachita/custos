const ICONS = {
  food: "restaurant",
  rent: "home",
  transport: "directions_car",
  entertainment: "theaters",
  utilities: "bolt",
  income: "payments",
  other: "sell",
};

export function categoryIcon(name) {
  return ICONS[(name || "").toLowerCase()] || "sell";
}
