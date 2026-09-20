import { RequireAuth } from '../components/RequireAuth.jsx';

export default function AdminLayout({ children }) {
  return <RequireAuth role="admin">{children}</RequireAuth>;
}
