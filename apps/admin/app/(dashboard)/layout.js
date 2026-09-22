import { RequireAuth } from '../components/RequireAuth.jsx';

export default function DashboardLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
