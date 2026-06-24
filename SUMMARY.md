## Goal
Build a production-ready platform on GCP VM with single login, role-based portals (Customer, Team Member, Admin), new request workflow, and admin user management.

## Constraints & Preferences
- No demo data, no backdoor passwords, all password management through UI
- Google OAuth is deferred
- Must work with existing Vercel frontend + GCP VM PocketBase infrastructure
- New statuses: Submitted → Assigned → Researching → Waiting for Customer → Approved → In Progress → Completed → Cancelled

## Progress
### Done
- Phase 1: Deleted all demo/test data from VM PB (users except admin@nripa.com, all requests, messages, notifications, reminders, life_profiles). Final state: 1 admin user, 0 of everything else.
- Fixed admin login bug (missing `await` before `login()` caused premature navigation)
- Fixed ProtectedAdmin route guard to also check `authStore` directly (prevented redirect loops)
- Switched VITE_POCKETBASE_URL from `http://34.123.136.226:8090` to `https://nri-personal-assistant.vercel.app` + Vercel rewrite proxying `/api/(.*)` → VM
- Redeployed to Vercel — API proxy verified working
- Phase 2: Created unified `/login` page at `src/pages/Login.jsx` with role-based redirect via ROLE_PORTALS. Old portal/admin login pages now redirect to `/login`.
- Phase 3: Created `src/config/roles.js` (SYSTEM_ROLES, ROLE_PORTALS, ROLE_LABELS). Registration now creates role='Customer' instead of 'User'. Team Member role added as middle tier.
- Phase 4: Updated REQUEST_STATUSES in appConfig.js to new 8-status pipeline. Updated ALL status references across the entire codebase (contexts, admin, portal, services, mock data, Home page).
- Phase 5: Created Team Member portal — `TeamLayout.jsx` sidebar, `team/Dashboard.jsx`, `team/Requests.jsx` with status update buttons and internal notes. Added /team/* routes with ProtectedTeam guard.
- Phase 6: Created `Admin Users` page (`admin/Users.jsx` w/ create/disable/reset password/delete). Exposed `loadAdminData` in AdminContext. Added Users nav link to AdminLayout.

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Vercel rewrite proxy over HTTPS cert on VM (simpler, no DNS/certbot needed)
- Team Member role added as middle tier between Customer and Admin for processing requests
- New statuses replace old 8-status system; old `Accepted`→`Assigned`, `Need Information`→`Waiting for Customer`, `Customer Responded`→`Assigned`, `Waiting For Approval`→`Waiting for Customer`, `Rejected`→`Cancelled`
- Default registration creates users with role='Customer' instead of role='User'
- Public routes wrapped in AuthProvider so Register/ForgotPassword/VerifyEmail can use useAuth()

## Next Steps
1. Deploy to Vercel and verify
2. Create Team Member users in PB admin with role='Team Member', test login → team portal
3. Test full customer lifecycle: register → login → create request → admin assigns to team → team processes → complete

## Critical Context
- **VM PocketBase**: `http://34.123.136.226:8090` — Health OK, 1 admin user
- **Vercel frontend**: `https://nri-personal-assistant.vercel.app` — API proxied via Vercel rewrites
- **PB URL (prod)**: `https://nri-personal-assistant.vercel.app` (same origin, no mixed content)
- **Vercel rewrite**: `/api/(.*)` → `http://34.123.136.226:8090/api/$1`
- **Admin credentials**: `admin@nripa.com` / `Admin@123`
- **User roles**: 'Customer', 'Team Member', 'Admin'
- **Current counts**: 1 admin user, everything else 0
- **GCP VM**: instance-20260622-173658, us-central1-a, 34.123.136.226, Ubuntu 24.04
- **Vercel project ID**: prj_LoqjL1PZc3s231xrIbyKfsuO9YjJ

## Relevant Files
- `src/pages/Login.jsx`: Unified login page with role-based redirect
- `src/config/roles.js`: SYSTEM_ROLES, ROLE_PORTALS, ROLE_LABELS
- `src/config/appConfig.js`: REQUEST_STATUSES with 8 new statuses
- `src/components/AdminLayout.jsx`: Admin sidebar (Dashboard, Users, Requests links)
- `src/components/TeamLayout.jsx`: Team member sidebar (Dashboard, Active Requests)
- `src/pages/admin/Users.jsx`: Admin user management (CRUD)
- `src/pages/team/`: Team Member portal pages
- `src/context/AuthContext.jsx`: Auth state, login, register, CRUD
- `src/context/AdminContext.jsx`: Admin state, includes loadAdminData
- `src/App.jsx`: Routes with /portal/*, /admin/*, /team/*
