import { RequireAuth } from '../components/RequireAuth.jsx';
import { PanelShell } from '../components/PanelShell.jsx';

// Rol kısıtı yok — sadece giriş yapılmış olması yeterli, çünkü /vendor/new henüz vendor
// olmayan (customer rolündeki) bir kullanıcı için de erişilebilir olmalı.
export default function VendorLayout({ children }) {
  return (
    <RequireAuth>
      <PanelShell>{children}</PanelShell>
    </RequireAuth>
  );
}
