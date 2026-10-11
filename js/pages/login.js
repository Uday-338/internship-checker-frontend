(() => {
  let role = "STUDENT";
  const err = document.getElementById("error");

  // Already signed in? Go straight to the right dashboard.
  const u = Session.getUser();
  if (Session.getToken() && u && u.role) location.href = `${String(u.role).toLowerCase()}/dashboard.html`;

  document.querySelectorAll("#roleTabs button").forEach((b) => {
    b.onclick = () => {
      role = b.dataset.role;
      document.querySelectorAll("#roleTabs button").forEach((x) => x.classList.toggle("on", x === b));
      document.getElementById("regLink").classList.toggle("hidden", role === "ADMIN");
    };
  });

  document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    err.classList.add("hidden");
    const btn = $("submitBtn");
    try {
      const data = await UI.busy(btn, "Logging in...", () =>
        AuthService.login({ email: $("email").value.trim(), password: $("password").value, role }));
      const user = data.user || data;                  // supports {token,user:{}} or flat response
      const token = data.token || data.accessToken || data.jwt;
      if (!token) throw new Error("Login succeeded but the server did not return a token.");
      const userRole = String(user.role || role).toUpperCase().replace(/^ROLE_/, "");   // accepts "ADMIN" or "ROLE_ADMIN"
      Session.save(token, { id: user.id, name: user.name, email: user.email, role: userRole });
      location.href = `${userRole.toLowerCase()}/dashboard.html`;
    } catch (ex) {
      err.textContent = ex.message; err.classList.remove("hidden");
    }
  };
})();
