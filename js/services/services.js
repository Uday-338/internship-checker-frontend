/** services.js - one function per backend endpoint. Pages never call fetch() directly. */
const E = CONFIG.ENDPOINTS;

const AuthService = {
  login: (d) => Api.post(E.LOGIN, d, { auth: false }),       // {email, password, role}
  register: (d) => Api.post(E.REGISTER, d, { auth: false }),
};
const StudentService = {
  getProfile: () => Api.get(E.MY_PROFILE),
  updateProfile: (d) => Api.put(E.MY_PROFILE, d),
  getAll: () => Api.get(E.ADMIN_STUDENTS),                    // admin
};
const InternshipService = {
  getAll: () => Api.get(E.INTERNSHIPS),
  getById: (id) => Api.get(E.INTERNSHIP(id)),
  checkEligibility: (id) => Api.post(E.CHECK_ELIGIBILITY(id)),
  create: (d) => Api.post(E.ADMIN_INTERNSHIPS, d),            // admin
  update: (id, d) => Api.put(E.ADMIN_INTERNSHIP(id), d),      // admin
  remove: (id) => Api.del(E.ADMIN_INTERNSHIP(id)),            // admin
};
const ApplicationService = {
  apply: (internshipId) => Api.post(E.APPLY, { internshipId: isNaN(internshipId) ? internshipId : Number(internshipId) }),
  getMine: () => Api.get(E.MY_APPLICATIONS),
  getAll: () => Api.get(E.ADMIN_APPLICATIONS),                // admin
  updateStatus: (id, status) => Api.put(E.ADMIN_APPLICATION_STATUS(id), { status }), // admin
};
