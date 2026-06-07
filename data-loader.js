const BASE = "/Leave-of-Absence-Law-Finder/";

export async function loadFederalLaws() {
  try {
    const res = await fetch(`${BASE}federal/laws.json`);
    if (!res.ok) throw new Error('Failed to load federal laws');
    const data = await res.json();

    return data.map(law => ({
      id: law.id,
      title: law.name,
      level: "Federal",
      state: "US",
      description: law.description,
      tags: law.leave_types?.map(t => t.type) || [],
      link: law.official_url
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function loadStateLaws(stateCode) {
  if (!stateCode) return [];
  try {
    const res = await fetch(`${BASE}states/${stateCode}/laws.json`);
    if (!res.ok) throw new Error('Failed to load state laws');

    const data = await res.json();
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
