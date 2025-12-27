export const isDemoMode = () => {
  return localStorage.getItem("isDemo") === "true";
};
