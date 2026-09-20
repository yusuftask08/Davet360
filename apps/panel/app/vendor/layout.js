import { RequireAuth } from '../components/RequireAuth.jsx';

// Rol kısıtı yok — sadece giriş yapılmış olması yeterli, çünkü /vendor/new henüz vendor
// olmayan (customer rolündeki) bir kullanıcı için de erişilebilir olmalı.
export default function VendorLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
