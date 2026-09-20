import { RequireAuth } from '../components/RequireAuth.jsx';

// Rol kısıtı yok — hem vendor hem admin kendi hesap ayarlarına erişebilir.
export default function SettingsLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
