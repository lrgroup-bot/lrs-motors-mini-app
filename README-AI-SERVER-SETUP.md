# LRS Motors Management System — AI / Server / Installer Handover

> CANONICAL HANDOVER DOCUMENT. An AI assistant helping install, repair, migrate, host, package, or continue this project should read this file first.

## 1. Project identity
- Project: LRS Motors Management System / LRS Motors Mini App
- Repository: `lrgroup-bot/lrs-motors-mini-app`
- Active PC/server branch: `pc-server`
- Current application: Next.js 15 + React 19 + TypeScript
- Local database: SQLite through `better-sqlite3`
- Default server port: `3000`
- Server binds to `0.0.0.0` so LAN clients can connect.
- Data directory defaults to `<project>/data`; override with environment variable `LRS_DATA_DIR`.

## 2. Architecture rule
The Windows PC/server is the authoritative data server. Desktop/browser clients connect to it over LAN/VPN. A future mobile APK must be offline-first: it keeps encrypted local data and an outbound sync queue while disconnected, then performs two-way synchronization when the server becomes reachable. Offline mode must never bypass role permissions or Director/CEO approval rules.

## 3. Required software for source installation
A development/source installation requires:
1. Windows 10/11 or Windows Server.
2. Git.
3. Node.js LTS and npm.
4. Build prerequisites required by native Node modules such as `better-sqlite3` if a prebuilt binary is unavailable.

Do not blindly install random packages. Read `package.json` and use `npm install`. Never commit passwords, API tokens, WhatsApp credentials, email credentials, Aadhaar/PAN files, customer documents, database files, or production secrets to Git.

## 4. Fresh source install
```bat
git clone https://github.com/lrgroup-bot/lrs-motors-mini-app.git
cd lrs-motors-mini-app
git checkout pc-server
npm install
npm run build
npm run server
```
Open locally at `http://localhost:3000`.

For another device on the same LAN use `http://SERVER-IP:3000`. Determine the Windows IPv4 address with `ipconfig`. Configure Windows Firewall only for the required private-network port. Do not expose port 3000 directly to the public Internet.

## 5. Existing installation update
```bat
git checkout pc-server
git pull
rmdir /s /q .next
npm install
npm run build
npm run server
```
If `npm run build` fails, fix the first real TypeScript/Next.js error before packaging or deployment. Warnings are not automatically build failures.

## 6. Persistent data and backup
The application uses SQLite. By default the database is under the `data` directory. For an installed server use a stable writable directory, for example:
```bat
set LRS_DATA_DIR=C:\ProgramData\LRS Motors\data
```
The installer/launcher must preserve this directory across upgrades. Never place the production database inside a temporary extraction directory. Back up the database and uploaded documents before migration or destructive repair.

## 7. Windows .EXE target
The final Windows deliverable should be a signed installer EXE, not merely a renamed Node script. Planned packaging structure:
- `LRS-Motors-Setup.exe` — installer/bootstrapper.
- Bundled production application files.
- Bundled compatible Node runtime so the normal user does not need to install Node manually.
- Native `better-sqlite3` binary compatible with the bundled Node runtime/Windows architecture.
- Persistent data under ProgramData.
- Start Menu/Desktop shortcut.
- Optional Windows startup/service mode for the server machine.
- Upgrade process that preserves database/uploads.
- Uninstaller that does NOT silently delete business data.

Until that packaging layer is implemented and tested, use the source-install commands in this document. Do not tell a user that a production EXE already exists unless the repository/release actually contains it.

## 8. Installer auto-requirement behavior
The final installer should perform preflight checks automatically. Prefer bundling runtime dependencies instead of downloading them during installation. If an external prerequisite is genuinely required, the installer should detect it, explain it, and install/download only from the official vendor over HTTPS with integrity/signature verification. Installation must not depend on Git being installed for ordinary end users.

Preflight checks should include:
- Supported Windows version and x64 architecture.
- Writable application/data directory.
- Port availability.
- Firewall/server-mode option.
- Existing installation/data migration.
- Backup before schema/application upgrade.
- Server health check after installation.

## 9. Server installation mode
A server setup should ask for:
- Installation folder.
- Data folder.
- Server port (default 3000).
- Start automatically with Windows: yes/no.
- LAN access: yes/no.
- Backup location.

After startup verify:
1. Login page loads locally.
2. Database opens successfully.
3. API routes respond.
4. Another authorized LAN device can reach the server if LAN mode was enabled.
5. Restarting the PC does not lose database records.

## 10. Client / future APK synchronization contract
Future clients must use stable record IDs, `created_at`, `updated_at`, deletion/tombstone metadata where needed, and a sync/version field. Client writes made offline go into a local sync queue. On reconnect:
1. authenticate device/user;
2. push queued mutations idempotently;
3. server validates role and approval permissions;
4. server returns accepted/rejected/conflicted operations;
5. client pulls changes newer than its last sync cursor;
6. conflicts involving financial/approval fields require server-side Director/CEO authority rather than last-write-wins;
7. update the local cursor only after a successful transaction/batch.

The PC server remains source of truth for approvals, costing, permissions, employee roles, and other protected records.

## 11. Security requirements
- Passwords must be hashed; never store plaintext passwords.
- Identity documents and customer documents require access controls and should be encrypted at rest in production.
- Keep Aadhaar/PAN/customer documents out of logs and Git.
- Role authorization must be checked by backend APIs, not only hidden in UI.
- Director-only actions must remain Director-only server-side.
- CEO access must follow the configured permission policy.
- Use HTTPS/VPN/reverse proxy for remote access; do not publicly expose an unauthenticated local server.
- Maintain audit logs for sensitive edits/approvals.

## 12. Main functional model
Top areas currently planned/implemented include Dashboard, Inventory, Customer/Leads, Sales & Marketing, Reports, and HR.

HR means Employee Database. Employee profiles contain staff identity/employment information with attendance, leave, salary/payroll, documents, and access/role information.

Vehicle workflow: staff adds vehicle -> management review -> Director/CEO enters/edits costing and approved sale value -> authorized sales workflow. Purchase cost/profit are protected management data and should not be shown to ordinary sales associates.

Sales workflow: registration number -> fetch approved vehicle -> selling price -> customer mobile -> fetch customer -> handover photo -> agreement capture/upload -> sale submission -> customer document/communication workflow.

## 13. AI continuation protocol
An AI taking over this repository should:
1. Read this file.
2. Inspect `package.json`, `src/lib/database.ts`, authentication/provider code, relevant API routes, and the page being changed.
3. Work on `pc-server` unless the user explicitly chooses another branch.
4. Preserve existing SQLite data and schema migrations.
5. Run/ask for `npm run build` after meaningful changes.
6. Fix TypeScript/build errors rather than disabling type checking globally.
7. Do not invent completed integrations. WhatsApp/email delivery requires authorized provider credentials/APIs. Mobile offline synchronization and Windows installer packaging must be explicitly implemented and tested before being described as production-ready.
8. Keep UI consistent with LRS Motors black/gold visual design and existing navigation.
9. Never expose management-only financial information to roles that do not have permission.
10. Update this README when architecture, installation, packaging, database, ports, or deployment procedures change.

## 14. Troubleshooting commands
```bat
git status
git branch
git pull
rmdir /s /q .next
npm install
npm run build
npm run server
```
If native dependency installation fails, record the exact Node version (`node -v`), npm version (`npm -v`), Windows architecture, and complete first error. Do not use `npm audit fix --force` merely to make warnings disappear; review breaking changes first.

## 15. Production readiness checklist
The system is not considered portable-production-ready until all are true:
- clean production build;
- tested database migration and backup/restore;
- server authentication/authorization audit;
- protected document storage;
- Windows installer/bootstrapper tested on a clean Windows machine;
- bundled runtime/native modules verified;
- upgrade/uninstall preserves business data;
- service/startup and firewall configuration tested;
- health check and logs implemented;
- mobile sync protocol implemented before offline APK release;
- authorized WhatsApp/email integrations configured before claiming automatic delivery.

This file is deliberately explicit so a human technician or another AI can continue the project without relying on prior chat history.
