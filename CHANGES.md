# Changes made to prepare the frontend for Spring Boot + MySQL

The original project already used `fetch()` through a central API layer, had no hard-coded
student/internship/application data, and covered every page and feature in the requirement list.
Those parts were kept as they are. Only the hardening below was added.

| File | Change | Why |
|---|---|---|
| `js/config.js` | Added `REQUEST_TIMEOUT_MS` (15 s). Base URL `http://localhost:8080/api` and all endpoints unchanged. | Loading states can no longer hang forever if the backend stops responding. |
| `js/services/apiClient.js` | Rewritten (same `Api`, `Session`, `ApiError` names). Adds request timeout; sends `Content-Type` only when a body exists; reads Spring error bodies (`message`, `error`, `errors[]`) and gives friendly text for 400/403/404/409/5xx; JWT `exp` check so an expired token sends the user to login (Spring often answers 403, not 401, for expired tokens); no token on a protected call -> login. | Reliable success/error/loading handling with a real Spring Boot backend. |
| `js/services/services.js` | `ApplicationService.apply` sends `internshipId` as a number. | Matches a `Long` field in the Spring DTO; the id previously came from the URL as a string. |
| `js/pages/login.js` | Accepts `token`, `accessToken` or `jwt`; shows an error if no token comes back; reads `ROLE_ADMIN` as `ADMIN`; safe redirect when already signed in. | Spring Security commonly returns `ROLE_` prefixed roles and different token field names. |
| `js/pages/student-internship-details.js` | Loading "my applications" is now separate from loading the internship; a failure there no longer blocks the page. Shows a fallback line when the backend returns no rejection reason. | The page keeps working; duplicate prevention still comes from the backend 409. |
| `README.md` | API contract notes updated (token/role/error formats, 401 vs 403, timeout). | Keeps the docs in line with the code. |
| `CHANGES.md` | New (this file). | Change log. |

No HTML, CSS, layout or navigation files were changed, so the existing design, links, buttons and forms behave as before.
