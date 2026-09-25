import { RequireAuth } from '../components/RequireAuth.jsx';
import { AdminShell } from '../components/AdminShell.jsx';

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
