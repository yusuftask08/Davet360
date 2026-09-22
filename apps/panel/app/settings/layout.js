import { RequireAuth } from '../components/RequireAuth.jsx';

// Rol kısıtı yok — giriş yapmış herkes kendi hesap ayarlarına erişebilir.
export default function SettingsLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
