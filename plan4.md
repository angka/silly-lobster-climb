# Project State: Plan 4 (Current)

## Current Features

### Authentication & Security
- **Supabase Auth**: Secure login and session management.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to user management and system settings.
  - **User**: Access to patient records and session management.
- **Password Management**:
  - Users can change their own passwords via the Settings page.
  - Admins can reset any user's password via the Admin Dashboard.
- **Security Policies**: Row Level Security (RLS) implemented on the `profiles` table.

### User Management (Admin Only)
- **Admin Dashboard**: View, create, delete, ban/unban users, and reset passwords.
- **Sync Tool**: Synchronize database profiles with authentication metadata.
- **Edge Function**: `admin-manage-users` handles sensitive administrative tasks like user creation and password resets.

### Patient & Session Management
- **Patient Records**: Full CRUD for patient profiles with search and category filtering.
- **Fitting Sessions**: Specialized worksheets for ROSE K2 XL and RGP lenses.
- **Follow-up Sessions**: Clinical testing records with links to previous fitting data.
- **Calendar**: Visual dashboard for upcoming follow-up appointments.

### Data Tools
- **Backup/Restore**: Export and import full system data via JSON or patient lists via CSV.

## File Manifest (Plan 4)

### Core & Routing
- `src/App.tsx`: Main router and protected route logic.
- `src/main.tsx`: Application entry point.
- `src/components/AuthProvider.tsx`: Auth state and role management.
- `src/components/Layout.tsx`: Main application shell with navigation.

### Pages
- `src/pages/Index.tsx`: Initial landing/redirect logic.
- `src/pages/LoginPage.tsx`: Authentication UI.
- `src/pages/DashboardPage.tsx`: Patient list, search, and data tools.
- `src/pages/AdminDashboardPage.tsx`: User management interface.
- `src/pages/SettingsPage.tsx`: User account settings (password change).
- `src/pages/PatientDetailsPage.tsx`: Patient profile and session history.
- `src/pages/FittingSessionPage.tsx`: Fitting worksheet container.
- `src/pages/FollowUpSessionPage.tsx`: Follow-up worksheet container.

### Components
- `src/components/PatientForm.tsx`: Patient profile editor.
- `src/components/FittingSessionForm.tsx`: ROSE K2 XL worksheet.
- `src/components/RGPFittingSessionForm.tsx`: RGP worksheet.
- `src/components/FollowUpSessionForm.tsx`: Follow-up worksheet.
- `src/components/FollowUpCalendar.tsx`: Appointment dashboard.
- `src/components/FittingProcedurePanel.tsx`: RGP procedure manager.
- `src/components/RoseK2XLFittingProcedurePanel.tsx`: ROSE K2 XL procedure manager.
- `src/components/SingleFittingProcedureForm.tsx`: RGP individual trial lens form.
- `src/components/SingleRoseK2XLFittingProcedureForm.tsx`: ROSE K2 XL individual trial lens form.

### Backend & Utils
- `supabase/functions/admin-manage-users/index.ts`: Admin operations edge function.
- `src/integrations/supabase/client.ts`: Supabase client configuration.
- `src/utils/toast.ts`: Notification utilities.
- `src/lib/utils.ts`: Tailwind merging and helper functions.

## Technical Stack
- React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase.