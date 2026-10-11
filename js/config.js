/**
 * config.js - the ONLY place API URLs live.
 * Change API_BASE_URL if your Spring Boot server runs somewhere else.
 */
const CONFIG = {
  API_BASE_URL:"https://internship-eligibility-backend.onrender.com/api",
  REQUEST_TIMEOUT_MS: 15000,   // a request that takes longer than this shows an error instead of loading forever

  ENDPOINTS: {
    // Auth
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",

    // Student
    MY_PROFILE: "/students/me",
    INTERNSHIPS: "/internships",
    INTERNSHIP: (id) => `/internships/${id}`,
    CHECK_ELIGIBILITY: (id) => `/internships/${id}/check-eligibility`,
    APPLY: "/applications",
    MY_APPLICATIONS: "/applications/my",

    // Admin
    ADMIN_INTERNSHIPS: "/admin/internships",
    ADMIN_INTERNSHIP: (id) => `/admin/internships/${id}`,
    ADMIN_STUDENTS: "/admin/students",
    ADMIN_APPLICATIONS: "/admin/applications",
    ADMIN_APPLICATION_STATUS: (id) => `/admin/applications/${id}/status`,
  },

  BRANCHES: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AI&DS"],
  STATUSES: ["APPLIED", "SHORTLISTED", "SELECTED", "REJECTED"],
};
