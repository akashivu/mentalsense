

export const isDemoMode = () => {
  return localStorage.getItem("isDemo") === "true";
};

export const enableDemoMode = () => {
  localStorage.setItem("isDemo", "true");
};

export const disableDemoMode = () => {
  localStorage.removeItem("isDemo");
};
