import { RequireAuth } from '../components/RequireAuth.jsx';

// Rol kısıtı yok — giriş yapmış herkes kendi hesap ayarlarına erişebilir.
export default function SettingsLayout({ children }) {
  return (
    <RequireAuth>
      <a href="#main-content" className="skip-link">
        İçeriğe geç
      </a>
      <div id="main-content">{children}</div>
    </RequireAuth>
  );
}
