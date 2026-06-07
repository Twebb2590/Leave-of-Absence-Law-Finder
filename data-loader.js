// data-loader.js

export async function loadFederalLaws() {
  try {
    const res = await fetch('./federal/laws.json');
    if (!res.ok) throw new Error('Failed to load federal laws');
    const data = await res.json();

    return data.map(law => ({
      id: law.id,
      title: law.name,                     // FIXED
      level: "Federal",                    // FIXED
      state: "US",                         // FIXED
      description: law.description,
      tags: law.leave_types?.map(t => t.type) || [],   // FIXED
      link: law.official_url               // FIXED
    }));
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
    
    const data = await res.json();

    // FIX: state laws are inside data.laws
    const laws = data.laws || [];

    return laws.map(law => ({
      id: law.id,
      title: law.name,
      level: "State",
      state: stateCode,
      description: law.description,
      tags: law.leave_types?.map(t => t.type) || [],
      link: law.official_url
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

