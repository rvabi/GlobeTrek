# GlobeTrek Adventures deployment

Status: **Aiven database provisioned and migrated; Render frontend and API not deployed**. Deployment files remain local and have not been committed or pushed. No public URLs have been assigned yet.

## Architecture and URLs

| Component | Provider and plan | Public URL |
|---|---|---|
| HTML/CSS/JavaScript frontend | Render Static Site, Free | Pending provider setup |
| ASP.NET Core 10 API | Render Web Service, Docker, Free | Pending provider setup |
| MySQL database | Aiven for MySQL, Free (`globetrek-mysql`) | `globetrek_db` over TLS; password remains outside Git |
| API health route | Render API | Pending API URL plus `/health` |

The browser makes HTTPS requests to the Render API. The API connects to Aiven MySQL with TLS and server certificate verification. No database credential or JWT key belongs in the frontend or Git.

## Verified free-plan limits

Render currently lists Free Static Sites and Free Web Services. The web service sleeps after 15 minutes idle and may take about one minute to wake. Free web services have 750 running instance-hours per workspace each month, no shell or one-off jobs, an ephemeral filesystem, and included bandwidth/build-minute limits. The static site uses included bandwidth/build minutes. These plans have HTTPS and `onrender.com` subdomains. See [Render Free](https://render.com/docs/free), [Static Sites](https://render.com/docs/static-sites), and [Web Services](https://render.com/docs/web-services).

Aiven currently lists MySQL Free at $0/month, no credit card required, with 1 CPU, 1 GB RAM, 1 GB storage and a limit of one free MySQL service per organization. Aiven may power off unused free services and does not offer a free-tier SLA. See [Aiven MySQL Free](https://aiven.io/docs/products/mysql/concepts/mysql-free-tier) and [MySQL pricing](https://aiven.io/pricing/mysql). These are suitable for a coursework demonstration, not an uptime commitment.

## Existing project configuration

- API project: `GlobeTrek.Api/GlobeTrek.Api.csproj`, targeting `net10.0`.
- Connection key: `ConnectionStrings:DefaultConnection`, supplied to the cloud as `ConnectionStrings__DefaultConnection`.
- JWT keys: `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`; cloud names use double underscores.
- CORS: `Cors:AllowedOrigins` contains local Live Server origins. Set `Cors__AllowedOrigins__2` to the exact HTTPS frontend origin after Render assigns it. Do not add a trailing slash or use `AllowAnyOrigin`.
- Local JWT key is supplied through ASP.NET user-secrets. Use a **different**, strong key in Render's secret environment variables.
- Swagger is available only in Development. It is intentionally unavailable in Production.
- `/health` checks that the API process answers HTTP. Test `/api/TourPackages` and `/api/Destinations` separately to confirm database connectivity.
- `GlobeTrek.Api/Properties/launchSettings.json` keeps local port 5072. The Docker entry point uses Render's `PORT` and binds to `0.0.0.0`; do not set a fixed production port.

## Aiven MySQL Free setup

1. The running service is **`globetrek-mysql` on the Free-1-1gb plan**, MySQL 8.4.8, DigitalOcean `blr`. The dedicated application database is **`globetrek_db`**; Aiven's `defaultdb` is the service default and is not the application target.
2. The connection host is `globetrek-mysql-globetrek-adventures.h.aivencloud.com`, port `16504`, user `avnadmin`. Aiven reports SSL mode `REQUIRED`. The migration connection succeeded with `SslMode=VerifyFull` and Aiven's CA certificate, which additionally verifies the certificate and hostname.
3. A copy of the public Aiven CA certificate is stored locally outside the repository at `%LOCALAPPDATA%\GlobeTrekDeployment\aiven-ca.pem`. In Render's API service, add it as a runtime Secret File named `aiven-ca.pem`; Render makes it available at `/etc/secrets/aiven-ca.pem`. The Docker runtime uses group 1000 for access.
4. Set `ConnectionStrings__DefaultConnection` in the Render API environment. Its structure is `Server=globetrek-mysql-globetrek-adventures.h.aivencloud.com;Port=16504;Database=globetrek_db;User ID=avnadmin;Password=<private value>;SslMode=VerifyFull;SslCa=/etc/secrets/aiven-ca.pem`. `VerifyFull` checks TLS, the CA and hostname. Do not paste the filled string into Git, an issue, or chat.

The existing EF Core migrations create all tables and seed **roles only** (Customer, Staff, Admin). All 11 existing migrations were applied to `globetrek_db` on 25 September 2026 using the command below. A subsequent read-only `migrations list` returned exit code 0 and listed all 11 without `(Pending)`. No local users, password hashes, bookings or payments were copied. The connection string was supplied only through a temporary process environment variable and was cleared afterwards; the password was not written to the repository.

```powershell
dotnet ef database update --no-build --configuration Release --project .\GlobeTrek.Api\GlobeTrek.Api.csproj --startup-project .\GlobeTrek.Api\GlobeTrek.Api.csproj --context AppDbContext
```

For future migrations, first confirm the target host and database, review any new migration, and show the exact command and target before execution. Do not run `database drop`, `migrations remove`, or a local-data export. Do not put the production connection string on a command line.

To bootstrap Admin without a tracked password: register a new account through the deployed public registration page using a password chosen privately by the owner; verify that account's email/ID in Aiven; then perform a narrowly scoped one-time role update to Admin through an authenticated database tool. Show the exact SQL and target before executing it. Thereafter Admin's user-management UI can promote a second privately registered account to Staff. Create a small set of public demo packages through the authorized management UI. Do not import local private users or test bookings.

## Render backend setup

The API requires Docker because Render's native runtime list does not include .NET. [Render Docker](https://render.com/docs/docker) and [Microsoft .NET 10 images](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/building-net-docker-images?view=aspnetcore-10.0) document this route.

1. After deployment changes are approved and pushed, create a **Web Service** linked to `https://github.com/rvabi/GlobeTrek.git`, branch `main`.
2. Select **Docker** and the **Free** compute plan. Set root directory to `GlobeTrek.Api` and Dockerfile path to `Dockerfile` within that root. Set health path `/health`. Do not add a disk or paid instance.
3. Add these Render environment variables: `ASPNETCORE_ENVIRONMENT=Production`, `ConnectionStrings__DefaultConnection`, `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`, and later `Cors__AllowedOrigins__2`. Use the actual issuer/audience values from `.env.example` unless intentionally changed in both configuration and tokens. Render supplies `PORT`.
4. Generate a separate random 64-byte JWT key locally and paste it directly into Render's `Jwt__Key` secret setting. Do not reuse the development user-secret or save the production key in the repository.
5. Add the Aiven CA as the Render runtime secret file. Deploy, record the assigned HTTPS API URL, and test `/health`, `/api/TourPackages`, and `/api/Destinations`. A 200 from `/health` alone does not prove the database works.

## Render frontend setup

1. After the API URL exists and deployment changes are approved and pushed, create a **Static Site** from the same repository and `main` branch. Use repository root as the service root, build command `sh frontend/build-render.sh`, and publish directory `frontend`.
2. Set the static site's build variable `GLOBETREK_API_BASE_URL` to the **actual** backend HTTPS URL followed by `/api`, without a trailing slash. The build script validates it and writes the existing central `frontend/js/config.js` in Render's build workspace. The Git copy remains pointed at `http://localhost:5072/api` for local development. No Node or frontend framework is needed.
3. Record the assigned HTTPS static-site URL. Set API variable `Cors__AllowedOrigins__2` to that exact origin and redeploy the API. Local Live Server origins remain allowed.
4. The Render site serves `frontend/` at domain root: `/index.html`, `/pages/...`, `/css/...`, and `/js/...`. The few role-return paths that previously assumed `/frontend/pages/` now accept both local and deployed layouts.

## Cloud verification checklist

- API: health; public packages and destinations; registration and login; authenticated Customer, Staff and Admin routes; expected 401/403 role boundaries; inactive account denial; no password hash in responses or unexpected 500 errors.
- Public site: Home, Packages, search/filter, details, Destinations, destination filtering, Register and Login.
- Customer: booking, **demonstration payment record**, My Bookings, create/edit Travel Plan, queries and Sign Out.
- Staff: dashboard, bookings, packages, accommodation, transportation, destinations, queries and Sign Out.
- Admin: dashboard, users, reports, shared Staff management, return control and Sign Out.
- Mobile: public and each role at about 390px; navigation, forms, tables, images, account action, return control and no page-wide overflow.
- Browser/hosting: HTTPS, CSS/JS/images loaded, no unexpected console errors, API logs free of database/TLS/migration/JWT/CORS failures.

Store real public screenshots in `deployment-evidence/` after the services work. Never capture passwords, tokens, connection strings or Render secret settings.

## Redeployment and troubleshooting

- The linked Render services redeploy from approved pushes to `main`; this task does not stage, commit or push.
- If the static site calls localhost, confirm its `GLOBETREK_API_BASE_URL` build variable and rerun the static build. Inspect served `/js/config.js` to verify the public API URL only.
- If browser requests fail with CORS, check that `Cors__AllowedOrigins__2` exactly equals the frontend origin. The API service must be redeployed after changing it.
- If MySQL connection fails, check Aiven service state, host/port/database/user, TLS CA secret file, `SslMode=VerifyFull`, and the API log. Never log the filled connection string.
- If the first API request is slow, Render Free may be waking from idle. If Aiven has powered off an unused free service, resume it from Aiven.
- A 401 is expected for anonymous protected calls; a 403 is expected for authenticated cross-role calls. Unexpected 500s require log investigation.
- If Docker builds fail, confirm Render root directory `GlobeTrek.Api`, Docker runtime, and that the Dockerfile uses official .NET 10 images.

## Local development

Start local MySQL with the existing `globetrek_db`, keep the JWT development key in user-secrets, run the API with the `http` launch profile at `http://localhost:5072`, and serve the repository with Live Server at `http://127.0.0.1:5500/frontend/` or `http://localhost:5500/frontend/`. The checked-in `frontend/js/config.js` points to the local API. The cloud connection string and production JWT key must never be used for routine local development.
