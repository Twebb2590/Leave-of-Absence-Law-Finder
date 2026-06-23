// All laws loaded into the system
import { allLaws, loadFederalLaws, loadStateLaws } from "./data-loader.js";

// -----------------------------
// DOM ELEMENTS
// -----------------------------
const filterPanelContainer = document.getElementById("filterPanelContainer");
const currentFiltersSummary = document.getElementById("currentFiltersSummary");
const searchInput = document.getElementById("searchInput");
const clearAllFiltersBtn = document.getElementById("clearAllFiltersBtn");
const compareStatesBtn = document.getElementById("compareStatesBtn");
const resultsContainer = document.getElementById("resultsContainer");

// -----------------------------
// GLOBAL FILTER STATE
// -----------------------------
let currentFilters = {
  state: null,
  leaveType: null,
  includeFederal: true,
  includeState: true,
};

// -----------------------------
// STATE LIST
// -----------------------------
const states = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" }
];

// -----------------------------
// LEAVE TYPES
// -----------------------------
const LEAVE_TYPES = [
  { id: "medical", label: "Medical / Sick" },
  { id: "pregnancy", label: "Pregnancy / Birth" },
  { id: "family", label: "Family Care" },
  { id: "bereavement", label: "Bereavement" },
  { id: "military", label: "Military" },
  { id: "jury", label: "Court / Jury Duty" },
];

// -----------------------------
// LOAD ALL LAWS
// -----------------------------
async function loadAllLaws() {
  const federal = await loadFederalLaws();

  // Clear array without reassigning
  allLaws.length = 0;

  // Add federal laws
  allLaws.push(...federal);

  // Add all state laws
  for (const s of states) {
    const stateLaws = await loadStateLaws(s.code);
    allLaws.push(...stateLaws);
  }

  // Now run search + filters
  applyFiltersAndSearch();
}

loadAllLaws();

// -----------------------------
// FILTER PANEL RENDERING
// -----------------------------
function renderFilterPanel(container, { states, leaveTypes, onChange }) {
  container.innerHTML = `
    <label>State:</label>
    <select id="stateFilter">
      <option value="">All</option>
      ${states.map(s => `<option value="${s.code}">${s.name}</option>`).join("")}
    </select>

    <label>Leave Type:</label>
    <select id="leaveTypeFilter">
      <option value="">All</option>
      ${leaveTypes.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
    </select>
  `;

  document.getElementById("stateFilter").addEventListener("change", (e) => {
    onChange({ state: e.target.value || null });
  });

  document.getElementById("leaveTypeFilter").addEventListener("change", (e) => {
    onChange({ leaveType: e.target.value || null });
  });
}

// -----------------------------
// UNIFIED SEARCH + FILTER ENGINE
// -----------------------------
function applyFiltersAndSearch() {
  let query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  let results = allLaws.filter(law => {
    const matchesSearch =
      !query ||
      law.title.toLowerCase().includes(query) ||
      law.description.toLowerCase().includes(query);

    const matchesState =
      !currentFilters.state || law.state === currentFilters.state;

    const matchesType =
  !currentFilters.leaveType ||
  (law.type && law.type.includes(currentFilters.leaveType));

    return matchesSearch && matchesState && matchesType;
  });

  renderResults(results);
}

// -----------------------------
// INSTANT SEARCH LISTENER
// -----------------------------
let searchTimeout = null;

if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => applyFiltersAndSearch(), 150);
  });
}

// -----------------------------
// SEARCH BUTTON (optional)
// -----------------------------
if (document.getElementById("searchBtn")) {
  document.getElementById("searchBtn").addEventListener("click", () => {
    applyFiltersAndSearch();
  });
}

// -----------------------------
// CLEAR FILTERS
// -----------------------------
if (clearAllFiltersBtn) {
  clearAllFiltersBtn.addEventListener("click", () => {
    currentFilters = {
      state: null,
      leaveType: null,
      includeFederal: true,
      includeState: true,
    };

    if (searchInput) searchInput.value = "";
    applyFiltersAndSearch();
  });
}

// -----------------------------
// COMPARE STATES BUTTON
// -----------------------------
if (compareStatesBtn) {
  compareStatesBtn.addEventListener("click", () => {
    window.location.href = "compare.html";
  });
}

// -----------------------------
// RENDER RESULTS
// -----------------------------
function renderResults(laws) {
  const container = document.getElementById("resultsContainer");
  const count = document.getElementById("resultsCount");

  container.innerHTML = "";
  count.textContent = `${laws.length} results`;

  laws.forEach(law => {
    const card = document.createElement("div");
    card.className = "law-card";
    card.innerHTML = `
      <h3>${law.title}</h3>
      <p>${law.description}</p>
      <p><strong>State:</strong> ${law.state}</p>
      <p><strong>Type:</strong> ${law.type}</p>
    `;
    container.appendChild(card);
  });
}

// -----------------------------
// INITIALIZE FILTER PANEL
// -----------------------------
if (filterPanelContainer) {
  renderFilterPanel(filterPanelContainer, {
    states: states,
    leaveTypes: LEAVE_TYPES,
    onChange: (filters) => {
      currentFilters = { ...currentFilters, ...filters };
      applyFiltersAndSearch();
    },
  });
}

// -----------------------------
// WIZARD → SEARCH INTEGRATION
// -----------------------------
window.addEventListener("wizardResults", (event) => {
  const { laws, wizardState } = event.detail;

  laws.forEach((law) => {
    if (!allLaws.some((l) => (l.id || l.title) === (law.id || law.title))) {
      allLaws.push(law);
    }
  });

  if (wizardState.state && wizardState.state !== "unknown") {
    currentFilters.state = wizardState.state;
  }

  applyFiltersAndSearch();
});
