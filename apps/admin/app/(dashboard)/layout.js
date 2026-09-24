import { RequireAuth } from '../components/RequireAuth.jsx';

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      {/* Admin navigasyonu 7 link + başlık içeriyor — klavye kullanıcısı her sayfada
          bunların hepsini tab'lamak zorunda kalmasın. Sayfalar kendi <main>'ini render
          ettiği için burada ikinci bir landmark açmak yerine düz div hedef olarak yeter. */}
      <a href="#main-content" className="skip-link">
        İçeriğe geç
      </a>
      <div id="main-content">{children}</div>
    </RequireAuth>
  );
}
