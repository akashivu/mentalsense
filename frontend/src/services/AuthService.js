import axios from "axios";

const API = "http://localhost:8080";

export async function register(name, email, password) {
  return axios.post(`${API}/auth/register`, { name, email, password });
}
export async function login(email, password) {
  return axios.post(`${API}/auth/login`, { email, password });
}

export function setToken(token) {
  localStorage.setItem("ms_token", token);
}
export function getToken() {
  return localStorage.getItem("ms_token");
}
export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
