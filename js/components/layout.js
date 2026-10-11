/** layout.js - builds the sidebar + top bar around every logged-in page. */
const NAV = {
  student: [["dashboard", "Dashboard", "📊"], ["profile", "My Profile", "👤"], ["internships", "Internships", "💼"], ["applications", "My Applications", "📄"]],
  admin: [["dashboard", "Dashboard", "📊"], ["internships", "Internships", "💼"], ["students", "Students", "🎓"], ["applications", "Applications", "📄"]],
};

function initLayout() {
  const b = document.body, role = b.dataset.role, active = b.dataset.active, root = b.dataset.root;
  const user = Session.requireRole(role);
  if (!user) return false;
  const page = document.getElementById("page");
  const shell = document.createElement("div");
  shell.className = "layout";
  shell.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="brand"><span class="logo">IE</span> Internship Checker</div>
      ${NAV[role].map(([key, label, icon]) =>
        `<a class="nav ${key === active ? "active" : ""}" href="${root}pages/${role}/${key}.html">${icon} ${label}</a>`).join("")}
      <div class="spacer"></div>
      <a class="nav" href="#" id="logoutBtn">🚪 Log out</a>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="menu-btn" id="menuBtn" aria-label="Open menu">☰</button>
        <strong>${UI.esc(b.dataset.title || "")}</strong>
        <div class="who"><span class="small muted">${role === "admin" ? "Administrator" : "Student"}</span>
          <div class="avatar">${UI.esc((user.name || "U").charAt(0).toUpperCase())}</div></div>
      </header>
      <main class="content" id="content"></main>
    </div>`;
  b.prepend(shell);
  shell.querySelector("#content").appendChild(page);
  shell.querySelector("#logoutBtn").onclick = (e) => { e.preventDefault(); Session.logout(); };
  shell.querySelector("#menuBtn").onclick = () => shell.querySelector("#sidebar").classList.toggle("open");
  return true;
}
