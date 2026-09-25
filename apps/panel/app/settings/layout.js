import { RequireAuth } from '../components/RequireAuth.jsx';
import { PanelShell } from '../components/PanelShell.jsx';

// Rol kısıtı yok — giriş yapmış herkes kendi hesap ayarlarına erişebilir.
export default function SettingsLayout({ children }) {
  return (
    <RequireAuth>
      <PanelShell>{children}</PanelShell>
    </RequireAuth>
  );
}
