# Internship Eligibility Checker - Frontend

Pure HTML + CSS + JavaScript frontend (no build step, no frameworks) for a Spring Boot + MySQL backend.

## Folder structure

```
internship-checker/
├── index.html                  redirects to the login page
├── css/style.css               all styles (responsive)
├── pages/
│   ├── login.html              student + admin login (role tabs)
│   ├── register.html           student registration
│   ├── student/                dashboard, profile, internships, internship-details, applications
│   └── admin/                  dashboard, internships (add/edit/delete), students, applications
└── js/
    ├── config.js               API base URL, timeout + every endpoint path (edit here only)
    ├── services/
    │   ├── apiClient.js        fetch() wrapper, JWT header, error handling, session helpers
    │   └── services.js         AuthService, StudentService, InternshipService, ApplicationService
    ├── components/
    │   ├── layout.js           sidebar + top bar, login/role guard
    │   └── ui.js               toast, modal, badges, chips, escaping helpers
    └── pages/                  one script per page
```

## Run in VS Code

1. Install **VS Code** and the **Live Server** extension (by Ritwick Dey).
2. `File > Open Folder...` and choose the `internship-checker` folder.
3. Start your Spring Boot backend (default `http://localhost:8080`).
4. Right-click `index.html` > **Open with Live Server**. It opens at `http://127.0.0.1:5500/`.
5. If your backend uses another port or context path, edit `API_BASE_URL` in `js/config.js`.

No Live Server? From the project folder run `python -m http.server 5500` and open `http://localhost:5500`.
Do not open the files by double-clicking (`file://`) - the browser will block API calls.

## Enable CORS in Spring Boot (required)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://127.0.0.1:5500", "http://localhost:5500")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```
If you use Spring Security, also call `http.cors(Customizer.withDefaults())` and permit `/api/auth/**`.

## API contract the frontend expects

All paths are relative to `API_BASE_URL` (`http://localhost:8080/api`). Send `Authorization: Bearer <token>` on protected routes.

| Purpose | Method + path | Request body | Response |
|---|---|---|---|
| Register | POST `/auth/register` | `{name,email,phone,branch,year,cgpa,password}` | 201 / message |
| Login | POST `/auth/login` | `{email,password,role}` role = `STUDENT` or `ADMIN` | `{token, user:{id,name,email,role}}` (flat also works; `accessToken`/`jwt` accepted instead of `token`; `ROLE_ADMIN` is read as `ADMIN`) |
| My profile | GET `/students/me` | - | student object |
| Update profile | PUT `/students/me` | `{name,phone,branch,year,cgpa,skills[],certifications[],resumeLink}` | student object |
| List internships | GET `/internships` | - | `[internship]` |
| One internship | GET `/internships/{id}` | - | internship |
| Check eligibility | POST `/internships/{id}/check-eligibility` | - | see below |
| Apply | POST `/applications` | `{internshipId}` | application. **Return 409 if already applied** |
| My applications | GET `/applications/my` | - | `[application]` |
| Add internship (admin) | POST `/admin/internships` | internship (no id) | internship |
| Edit internship (admin) | PUT `/admin/internships/{id}` | internship | internship |
| Delete internship (admin) | DELETE `/admin/internships/{id}` | - | 204 |
| All students (admin) | GET `/admin/students` | - | `[student]` |
| All applications (admin) | GET `/admin/applications` | - | `[application]` |
| Update status (admin) | PUT `/admin/applications/{id}/status` | `{status}` | application |

Errors: return JSON like `{"message": "Email already registered"}` - the frontend shows `message` to the user (Spring's default error body, `{"error": ...}` and `{"errors": [...]}` validation lists also work).
Return **401** for a missing/expired token (the frontend then sends the user to the login page) and **403** when the role is not allowed. Requests time out after `REQUEST_TIMEOUT_MS` (15 s, set in `js/config.js`).

**Internship**
```json
{ "id": 1, "company": "Infosys", "title": "Java Developer Intern", "location": "Hyderabad",
  "duration": "3 months", "stipend": 15000, "minCgpa": 7.0,
  "eligibleBranches": ["CSE","IT"], "requiredSkills": ["Java","SQL","Spring Boot"], "description": "..." }
```
**Student** (arrays may also be comma-separated strings)
```json
{ "id": 5, "name": "Asha", "email": "asha@college.edu", "phone": "9876543210", "branch": "CSE",
  "year": 3, "cgpa": 8.2, "skills": ["Java","SQL"], "certifications": ["Oracle Java SE"], "resumeLink": "https://..." }
```
**Application**
```json
{ "id": 9, "status": "APPLIED", "appliedDate": "2026-10-08",
  "student": { "id": 5, "name": "Asha", "email": "...", "branch": "CSE", "cgpa": 8.2 },
  "internship": { "id": 1, "company": "Infosys", "title": "Java Developer Intern", "location": "Hyderabad" } }
```
Status values: `APPLIED`, `SHORTLISTED`, `SELECTED`, `REJECTED`.

**Eligibility response** (calculated by the backend from the logged-in student + internship)
```json
{ "eligible": false, "skillMatchPercentage": 67,
  "reasons": ["CGPA 6.5 is below the minimum 7.0", "Branch ECE is not eligible"],
  "missingSkills": ["Spring Boot"],
  "suggestions": ["Learn Spring Boot", "Raise your CGPA to 7.0 or above"] }
```
Skill match % = matched required skills / total required skills x 100 (compare case-insensitively).
Eligible only if CGPA >= minCgpa AND branch is allowed AND the required skills are covered (your rule).

## Suggested test flow
1. Register a student > log in > fill the profile (CGPA, skills).
2. Log in as admin (create the admin row in MySQL) > add an internship.
3. As student: open the internship > Check eligibility > Apply > try applying again (duplicate is blocked).
4. As admin: Applications > change status > student sees the new status.
