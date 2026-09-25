# GlobeTrek Adventures deployment

## Status and architecture

| Component | Provider | Current address/status |
| --- | --- | --- |
| Frontend | Cloudflare Pages Free | Catalogue ready; GitHub OAuth and approved Git update pending |
| API | MonsterASP.NET Free, .NET 10 | https://globetrek-api.runasp.net |
| Database | Aiven MySQL Free | `globetrek_db`; 11 EF Core migrations applied |
| API health | MonsterASP.NET | https://globetrek-api.runasp.net/health |

The API uses `SslMode=VerifyFull` with Aiven's CA file. The website's CA file is under `D:\Sites\site93758\private\aiven-ca.pem`, outside its public `wwwroot`. HTTPS on the free MonsterASP subdomain was manually activated after support ticket #9263. A certificate-validating HTTPS request returned 200; no certificate-validation bypass was used.

The production catalogue contains five active demo destinations, five accommodations, five transportation services and five active tour packages. All five package detail responses include valid accommodation and transportation links. These are illustrative academic records; no private/local customer data was imported. The public frontend is not live yet.

## Backend configuration

Set these names in the MonsterASP.NET website's environment-variable panel. Enter secret values there only; they do not belong in Git, screenshots, tickets or the frontend:

- `ASPNETCORE_ENVIRONMENT`
- `ConnectionStrings__DefaultConnection`
- `Jwt__Key`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Cors__AllowedOrigins__2` (add the exact Cloudflare Pages HTTPS origin once assigned)

`ConnectionStrings__DefaultConnection` targets Aiven host `globetrek-mysql-globetrek-adventures.h.aivencloud.com`, port `16504`, database `globetrek_db`, user `avnadmin`, and uses `SslMode=VerifyFull` plus the private CA path. Do not replace it with a less strict SSL mode. The local origins in `appsettings.json` remain allowed. Swagger is limited to Development.

The backend was published in Release mode from `GlobeTrek.Api/GlobeTrek.Api.csproj` and uploaded as compiled output into the MonsterASP website's `wwwroot`. The upload archive was moved out of `wwwroot` after extraction. The .NET 10 app runs in IIS in-process. Aiven already has all 11 existing migrations; no cloud data was imported from local users or bookings.

## Cloudflare Pages setup (after approved Git update)

Official [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) supports a plain static HTML site without a framework or build command.

1. Connect `https://github.com/rvabi/GlobeTrek.git` and select `main`.
2. Set root directory to `frontend`. Select no framework. Leave build command blank. Use `.` as the build output directory relative to that root if the form requires a value.
3. The single frontend API configuration in `frontend/js/config.js` uses `http://localhost:5072/api` for localhost/127.0.0.1 and `https://globetrek-api.runasp.net/api` elsewhere. Push that reviewed change only after owner approval; the current GitHub `main` still contains the local-only URL.
4. Record the actual `https://<project>.pages.dev` URL. Set `Cors__AllowedOrigins__2` on MonsterASP to that exact origin, with no trailing slash, and recycle the API.
5. Verify preflight CORS and public/customer/staff/admin flows on the actual Pages URL. Keep local Live Server origins.

Cloudflare's [static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) confirms that no frontend framework is required and a top-level `index.html` is needed; GlobeTrek has one.

## Verification completed

A certificate-validating HTTPS request returned 200 for `/health`. Disposable test customers registered (201), logged in (200), and accessed `/api/Bookings/my` (200) over HTTPS, confirming Aiven writes, reads and JWT authentication. The one-time disposable UserId 4 was promoted from Customer to Staff using a transaction guarded by user ID, previous role, active status and email; exactly one row changed. A fresh HTTPS login returned Staff, the Staff bookings endpoint returned 200, and the Admin users endpoint returned 403. Keep UserId 4 as Staff until the production Staff workflow has been tested; do not revert it automatically.

The deployed Staff API created five active records each for destinations, accommodations, transportation services and tour packages. Public HTTPS list endpoints returned 200 with five records each. All five package detail endpoints returned valid destination names and included the corresponding active accommodation and transportation. The demo records do not include customer bookings or payments. MonsterASP access logs showed no 5xx responses during earlier checks. A later application-pool termination recovered with a successful start; investigate if it repeats.

Production frontend, full browser flows, Admin account access, security coverage beyond the verified Staff boundary, and mobile checks are pending.

## Redeployment and local development

For backend changes, run `dotnet publish GlobeTrek.Api/GlobeTrek.Api.csproj -c Release -o <outside-repo-publish-directory>`, upload the compiled output through the MonsterASP file manager or official Web Deploy workflow, keep deployment archives out of `wwwroot`, and recycle the app. Preserve the private CA and production environment variables. Recheck `/health`, public queries, authenticated access and logs.

Cloudflare Pages redeploys the approved `main` branch through Git integration. Do not push assignment artifacts. Keep `FINAL_SUBMISSION/` unchanged.

For local work, run the API using its HTTP launch profile on `http://localhost:5072`, with the local MySQL database and a development JWT user-secret. Serve `frontend/` with Live Server at `http://localhost:5500` or `http://127.0.0.1:5500`. The hostname-aware `config.js` keeps local API traffic on port 5072.

## Free-plan limits and troubleshooting

MonsterASP Free has a small memory allocation and an observed 30-minute idle application-pool timeout. The first request after idling may be slower. HTTPS activation on this free subdomain required a support ticket; check the certificate and renewal status in the hosting panel. Aiven MySQL Free has limited storage and may pause after inactivity. Cloudflare Pages Free has build/deployment limits documented by Cloudflare.

If health fails, inspect MonsterASP event and ASP.NET logs before changing configuration. If public data calls fail, inspect Aiven service status and the VerifyFull CA path. If Pages reports a network/CORS error, verify that the checked-in `config.js` points to the HTTPS API and that `Cors__AllowedOrigins__2` exactly matches the Pages origin. Never print production connection strings or JWT secrets while debugging.
