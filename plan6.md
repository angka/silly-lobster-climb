# Project State: Plan 6 (Current)

## Current Features

### Authentication & Security
- **Supabase Auth**: Secure login and session management.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to user management, system settings, and bulk patient operations.
  - **User**: Access to patient records and session management.
- **Password Management**: Users can change passwords; Admins can reset any user's password.
- **Security Policies**: Row Level Security (RLS) implemented on all tables.

### User Management (Admin Only)
- **Admin Dashboard**: View, create, delete, ban/unban users, and reset passwords.
- **Sync Tool**: Synchronize database profiles with authentication metadata.
- **Edge Function**: `admin-manage-users` handles sensitive administrative tasks.

### Patient & Session Management
- **Patient Records**: Full CRUD for patient profiles with search, category filtering, and ownership reassignment.
- **Fitting Sessions**: Specialized worksheets for ROSE K2 XL and RGP lenses.
- **Follow-up Sessions**: Clinical testing records with links to previous fitting data.
- **Calendar**: Visual dashboard for upcoming follow-up appointments.

### UI & Form Enhancements (New)
- **Multi-line Observations**: Pentacam/Orbscan and Dia/Loc/Mov fields now support multi-line text for detailed clinical notes.
- **Improved Procedure Layout**: BCVA field added side-by-side with Over Refraction in ROSE K2 XL procedures for better data entry flow.

### Print Optimization
- **Compact Fitting Layout**: Both eyes and all trial lens procedures optimized to fit on a single page.
- **Compact Follow-up Layout**: Individual follow-up sessions formatted for minimal space usage.
- **Follow-up History Printing**: Specialized view that prints all follow-up records for a patient, formatted 2-per-page.

### Data Tools
- **Backup/Restore**: Export and import full system data via JSON or patient lists via CSV.
- **Bulk Actions**: Admin-only bulk deletion and ownership reassignment for patient records.

## File Manifest (Plan 6)

### Core & Routing
- `src/App.tsx`: Main router and protected route logic.
- `src/main.tsx`: Application entry point.
- `src/components/AuthProvider.tsx`: Auth state and role management.
- `src/components/Layout.tsx`: Main application shell.

### Pages
- `src/pages/Index.tsx`: Initial landing/redirect logic.
- `src/pages/LoginPage.tsx`: Authentication UI.
- `src/pages/DashboardPage.tsx`: Patient list, search, and bulk tools.
- `src/pages/AdminDashboardPage.tsx`: User management interface.
- `src/pages/SettingsPage.tsx`: User account settings.
- `src/pages/PatientDetailsPage.tsx`: Patient profile, session history, and print history trigger.
- `src/pages/FittingSessionPage.tsx`: Fitting worksheet container.
- `src/pages/FollowUpSessionPage.tsx`: Follow-up worksheet container.

### Components
- `src/components/PatientForm.tsx`: Patient profile editor with owner selection.
- `src/components/FittingSessionForm.tsx`: ROSE K2 XL worksheet (Multi-line Pentacam/Orbscan).
- `src/components/RGPFittingSessionForm.tsx`: RGP worksheet.
- `src/components/FollowUpSessionForm.tsx`: Follow-up worksheet.
- `src/components/FollowUpCalendar.tsx`: Appointment dashboard.
- `src/components/FittingProcedurePanel.tsx`: RGP procedure manager.
- `src/components/RoseK2XLFittingProcedurePanel.tsx`: ROSE K2 XL procedure manager.
- `src/components/SingleFittingProcedureForm.tsx`: RGP trial lens form.
- `src/components/SingleRoseK2XLFittingProcedureForm.tsx`: ROSE K2 XL trial lens form (Multi-line Dia/Loc/Mov, side-by-side BCVA).

### Backend & Utils
- `supabase/functions/admin-manage-users/index.ts`: Admin operations edge function.
- `src/integrations/supabase/client.ts`: Supabase client configuration.
- `src/utils/toast.ts`: Notification utilities.
- `src/globals.css`: Global styles with advanced print optimizations.

## Technical Stack
- React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase.