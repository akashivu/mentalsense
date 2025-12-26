const BASE = import.meta.env.VITE_API_BASE;

if (!BASE) {
  throw new Error("VITE_API_BASE is missing at build time");
}

export default BASE;
