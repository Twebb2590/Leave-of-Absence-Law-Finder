// data-loader.js
// Simple loader for federal and state JSON files.
// Adjust paths to match your existing JSON structure.

export async function loadFederalLaws() {
  try {
    const res = await fetch('./federal/laws.json');
    if (!res.ok) throw new Error('Failed to load federal laws');
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function loadStateLaws(stateCode) {
  if (!stateCode) return [];
  try {
    const res = await fetch(`./states/${stateCode}/laws.json`);
    if (!res.ok) throw new Error('Failed to load state laws');
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}
