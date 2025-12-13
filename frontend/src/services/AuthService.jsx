
export function setToken(token) {
  localStorage.setItem("ms_token", token);
}

export function getToken() {
  return localStorage.getItem("ms_token");
}

export function clearToken() {
  localStorage.removeItem("ms_token");
}
