# GlobeTrek Adventures final audit — 24 September 2026

## 1. Project status

The existing HTML/CSS/vanilla JS, ASP.NET Core API, EF Core, MySQL and JWT architecture was preserved. The exact in-place build passed with **0 warnings and 0 errors**. The updated API on `http://localhost:5072` passed public, Customer, Staff and Admin runtime smoke tests. The broader API and browser audit was also completed against the same final backend source on an isolated port.

Final build command:

```powershell
cd C:\Users\hp\Desktop\GlobeTrek-Adventures\GlobeTrek.Api
dotnet build
```

## 2. Issues found

- Existing uncommitted work included a completion pack, large page/style changes and a deleted empty root file. The active source changes were preserved; the temporary pack was removed only after verifying its application copies.
- API responses containing a `User` navigation object could serialize `PasswordHash`.
- A changed role did not invalidate an existing JWT. Self role changes and self deactivation were allowed by the Admin API.
- The shared frontend API helper discarded validation details and did not clear invalid protected sessions; login accepted an unchecked return URL.
- A completed demo payment left the summary showing `Pending` until reload.
- The database contains two active Ella destinations. Two historical bookings have completed payments but their customer rows are missing; required joins previously hid those bookings and payments from Staff listings and detailed Admin reports. Two historical support queries also have missing customer rows and were hidden from Staff.
- Nine zero-byte legacy files were found in `frontend/` root. After checking resolved live links and working replacements, seven were removed. `contact.html` and `customer-dashboard.html` remain because there is no direct working page replacement. The pre-existing zero-byte `frontend/staff-dashboard.html` deletion remains.
- Several Staff/Admin arrows were rendered as mojibake.
- During the final 5072 smoke test, a stale JWT was attached to the login request after a role change, preventing a fresh login. Inner-page navigation and Sign Out were hidden at mobile widths.

## 3. Files changed during this audit

- Backend: `Controllers/AdminController.cs`, `AuthController.cs`, `BookingsController.cs`, `CustomerQueriesController.cs`, `PaymentsController.cs`, `ReportsController.cs`, `TravelPlansController.cs`; `DTOs/RegisterRequest.cs`; `Middleware/ActiveUserMiddleware.cs`; `Models/User.cs`.
- Frontend: `css/style.css`; `js/api.js`, `auth.js`, `packages.js`, `payment.js`, `staff-accommodations.js`, `staff-destinations.js`, `staff-packages.js`, `staff-bookings.js`, `staff-dashboard.js`, `admin-users.js`, `destinations.js`; `pages/register.html`, `pages/staff/dashboard.html`, `pages/staff/packages.html`, `pages/admin/dashboard.html`.
- This report: `FINAL_AUDIT_REPORT.md`.

Many other modified or untracked files in `git status` predated this audit. No migrations, existing users, bookings or payments were deleted. The temporary browser API setting was restored to `http://localhost:5072/api`.

## 4. Backend tests completed

- Exact in-place `dotnet build`: succeeded, 0 warnings, 0 errors. The earlier isolated build also passed.
- Public: packages, search, details, destinations, accommodation and transportation returned 200; invalid search returned 400.
- Customer: registration/login, bookings, payment, travel plans and queries returned expected success statuses. Invalid travelers and past dates returned 400. Duplicate payment and travel plan returned 400. Another customer's booking, payment, plan and query details returned 403; creating payment/plan for another booking returned 404. Anonymous protected request returned 401.
- Staff: booking, payment, plan and query lists returned 200; Admin users/reports returned 403. Accommodation, transportation, destination and linked package create/update/deactivate succeeded. Their audit records were soft-deactivated afterward and the package disappeared from the public list. Booking status, payment status and query response updates succeeded.
- Admin: users, staff list, dashboard/sales/customer/booking reports and shared Staff API returned 200. Role and status changes worked for a disposable account. Self role change and self deactivation returned 400.
- Security: old JWTs returned 401 after role changes and deactivation; inactive login returned 401; reactivation restored login. Checked responses contained no `PasswordHash`.
- Historical data: before the final smoke booking, Staff booking/payment APIs returned all 5 rows; dashboard and detailed sales each returned LKR 360,000 across 5 completed payments. The final 5072 smoke test created booking/payment #6; Staff lists now show 6 bookings and Admin dashboard/detailed sales both show LKR 450,000 across 6 completed payments. Historical bookings and queries with missing users display `Former customer`. Staff queries returned all 4 rows, and Staff/Admin plans returned all 3 remaining rows.
- Resolved customer query deletion returned 400. The disposable customer's travel plan delete returned 200 and the plan list became empty.

## 5. Frontend tests completed

- Browser testing used the Codex in-app browser's Playwright locator/DOM API. The separate **Playwright MCP** was not installed, and `npx` was unavailable on the shell's PATH. If desired, after making Node.js/npm available, the [official Playwright MCP setup](https://github.com/microsoft/playwright-mcp) command is:

  ```powershell
  codex mcp add playwright npx "@playwright/mcp@latest"
  ```

- Public home, packages, search, destination detail to package filter, package details, login and registration loaded. Literal local HTML links/scripts/styles resolved; tested images loaded.
- Customer booking, payment, bookings, travel plan and query pages loaded and their primary interactions succeeded.
- All seven Staff pages loaded without new console errors. The final Staff query page rendered all 4 records, including both historical `Former customer` entries. Admin users/reports/dashboard and all shared Staff pages loaded. Admin return navigation worked and did not appear for Staff.
- At 390 px width, tested public, Customer, Staff and Admin pages had no page-level horizontal overflow or broken image elements. The mobile home menu opened and exposed its links.
- Final 5072 browser smoke: package search/detail, Customer registration/login, booking #6, demo payment, confirmed My Bookings, Staff dashboard/bookings/queries, Admin dashboard/users/reports, role redirects, and Admin return navigation passed. The 390 px inner-page header now exposes navigation and Sign Out; checked public, Customer and Admin pages had no header overlap or horizontal page overflow.
- Expected 401 console entries appeared while deliberately testing stale tokens during role changes. After fresh sign-in, there were no unresolved application console errors.

## 6. Customer journey result

**Passed.** A disposable Customer registered and logged in, browsed/searched Ella, opened package details, booked 2 travelers for 24 November 2026 (LKR 90,000), completed the demo payment, saw a Confirmed booking, created and updated a travel plan, submitted a query and later saw the Staff response as Resolved. The audit plan was subsequently deleted to verify that endpoint.

## 7. Staff journey result

**Passed on the audit account temporarily assigned Staff.** Dashboard, bookings, packages, accommodation, transportation, destinations and queries loaded. Management CRUD and response/status operations passed through the final API. Staff access to Admin users/reports was denied. The audit account was later restored to Customer.

## 8. Admin journey result

**Passed on the audit account temporarily assigned Admin.** Dashboard, users and reports loaded; a disposable user was activated, changed to Staff, restored to Customer and deactivated from the UI. Admin opened every shared Staff page and used `← Back to Admin Dashboard`. The primary audit account was restored to Customer afterward.

## 9. Security checks

- Customer to Staff/Admin page: redirected. Staff to Admin page: redirected. Admin to Staff pages: allowed.
- API role boundaries returned 403; inactive and role-changed JWTs returned 401.
- API user serialization excludes password hashes. Admin cannot change/deactivate own account.
- External `returnUrl` was ignored after login. Frontend 401 clears the invalid session and routes to login; 403 handling does not clear it.
- Login and registration requests no longer attach an existing JWT, so a stale role token cannot block fresh sign-in.
- API validation errors now surface useful messages; registration requires a valid email and at least 8 password characters.

## 10. UI/UX improvements

- Payment success immediately changes summary status to `Confirmed` and button text to `Payment Completed`.
- Admin's own role/status controls are disabled with an explanation; role select labels are associated with their fields.
- Broken arrow glyphs were repaired. Image URLs interpolated into dynamic card HTML are escaped. Missing historical customers display as `Former customer`.
- Inner pages keep a visible, horizontally scrollable navigation row and account action on small screens.

## 11. Remaining limitations

- MySQL must be running on port 3306 before starting the API. During final verification, the installed WAMP MySQL service was stopped and could not be started through Service Control from this session; its `mysqld.exe` was started locally for testing. Start the WAMP MySQL service normally for a durable setup.
- This project records a demo payment; it does not connect to a real payment gateway.
- Existing duplicate Ella destinations, historical bookings/payments and support queries with missing customer records were preserved. The UI now includes those historical rows without deleting or rewriting data.
- The temporary completion pack, pre-apply backups and apply helper were removed after verifying that their active files exist in the application and no runtime source references the temporary paths. Two zero-byte root placeholders remain pending direct replacements: `contact.html` and `customer-dashboard.html`.
- This audit created disposable paid bookings #5 and #6 and resolved query #4 as end-to-end evidence. Additional temporary management records were soft-deactivated. One disposable security-test user (#9) was left inactive. Audit accounts #7 and #10 are active Customer again; #10 was signed out after final verification.

## 12. Exact run instructions

1. Start the WAMP MySQL service (`wampmysqld64`) so MySQL listens on port 3306. For example, from an elevated PowerShell terminal:

   ```powershell
   Start-Service wampmysqld64
   ```

2. With the existing user-secrets configuration intact, run the API if it is not already listening on port 5072:

   ```powershell
   cd C:\Users\hp\Desktop\GlobeTrek-Adventures\GlobeTrek.Api
   dotnet build
   dotnet run --launch-profile http
   ```

3. Open the workspace root in VS Code, serve it with Live Server, and open `http://127.0.0.1:5500/frontend/`.

## 13. Submission readiness

**Ready for final staging and a local commit.** The exact build, 5072 runtime smoke tests, role boundaries, mobile navigation and `git diff --check` passed. Final cleanup removed unused temporary copies and seven additional zero-byte placeholders. `git status` shows 24 modified files, 8 deleted files, 17 untracked files and nothing staged on `main` (up to date with `origin/main`). Stage the active source and report deliberately; no push or commit was made.

Suggested final commit message: `Polish GlobeTrek flows and secure role-aware reporting`
