async function hasSupabaseSession() {
  if (!window.supabaseClient) {
    return localStorage.getItem("adminMode") === "true";
  }

  const { data } = await supabaseClient.auth.getSession();
  return Boolean(data.session);
}

async function isEditMode() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("edit") === "false") {
    localStorage.removeItem("adminMode");
    return false;
  }

  const hasSession = await hasSupabaseSession();

  if (!hasSession) {
    localStorage.removeItem("adminMode");
    return false;
  }

  localStorage.setItem("adminMode", "true");
  return true;
}

async function applyAdminVisibility() {
  const showAdmin = await isEditMode();

  document.querySelectorAll(".admin-only").forEach(element => {
    element.style.display = showAdmin ? "block" : "none";
  });
}

window.applyAdminVisibility = applyAdminVisibility;

applyAdminVisibility();
