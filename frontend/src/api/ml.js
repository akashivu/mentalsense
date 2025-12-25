const BASE = import.meta.env.VITE_API_BASE_URL;


function getToken() {
  return localStorage.getItem("ms_token");
}

export async function fetchTrendForUser(userId) {
  const token = getToken();

  const res = await fetch(`${BASE}/user/${userId}/trend`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  if (!res.ok) throw new Error(`trend fetch ${res.status}`);
  return res.json();
}

export async function checkAnomaly(userId, value) {
  const token = getToken();

  const res = await fetch(`${BASE}/user/${userId}/anomaly`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ value }),
  });

  if (!res.ok) throw new Error(`anomaly ${res.status}`);
  return res.json();
}
