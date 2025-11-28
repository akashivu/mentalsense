const BASE = "http://localhost:8080"; // backend port

export async function fetchTrendForUser(userId) {
  const res = await fetch(`${BASE}/user/${userId}/trend`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`trend fetch ${res.status}`);
  return res.json(); // expects { "future": [...], ... } or whatever ML returns
}

export async function checkAnomaly(userId, value) {
  const res = await fetch(`${BASE}/user/${userId}/anomaly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`anomaly ${res.status}`);
  return res.json(); // expects {"anomaly": 1} or {"anomaly": -1}
}
