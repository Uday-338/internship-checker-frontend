/** ui.js - small reusable helpers: escaping, chips, badges, toasts, modals. */
const UI = {
  esc: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  /** Accepts an array or a comma separated string and returns a clean array. */
  list(v) {
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
    return v ? String(v).split(",").map((x) => x.trim()).filter(Boolean) : [];
  },
  chips(v, cls = "") {
    const items = UI.list(v);
    return items.length ? items.map((x) => `<span class="chip ${cls}">${UI.esc(x)}</span>`).join("") : '<span class="muted">-</span>';
  },
  stipend(v) {
    if (v === null || v === undefined || v === "") return "Unpaid";
    return isNaN(v) ? UI.esc(v) : "₹" + Number(v).toLocaleString("en-IN") + "/month";
  },
  date(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"; },
  statusBadge(s) {
    const k = String(s || "APPLIED").toLowerCase();
    return `<span class="badge b-${k}">${k.charAt(0).toUpperCase() + k.slice(1)}</span>`;
  },
  spinner: (msg = "Loading...") => `<div class="spinner">${msg}</div>`,
  empty: (msg) => `<div class="empty">${msg}</div>`,
  toast(msg, type = "info") {
    let box = document.getElementById("toasts");
    if (!box) { box = document.createElement("div"); box.id = "toasts"; document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "toast " + type; t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  },
  openModal: (id) => document.getElementById(id).classList.add("open"),
  closeModal: (id) => document.getElementById(id).classList.remove("open"),
  /** Disable a button while an async action runs. */
  async busy(btn, label, fn) {
    const old = btn.textContent; btn.disabled = true; btn.textContent = label;
    try { return await fn(); } finally { btn.disabled = false; btn.textContent = old; }
  },
  internshipMeta: (i) => `
    <div class="meta">
      <span>📍 <b>${UI.esc(i.location)}</b></span><span>⏱ <b>${UI.esc(i.duration)}</b></span>
      <span>💰 <b>${UI.stipend(i.stipend)}</b></span><span>🎓 Min CGPA <b>${UI.esc(i.minCgpa)}</b></span>
    </div>`,
};

/** Short alias: $("id") */
const $ = (id) => document.getElementById(id);
