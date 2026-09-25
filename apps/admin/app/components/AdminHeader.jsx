// Sayfa başlığı — gezinme, hesap ve çıkış artık layout'taki AdminShell'de.
export function AdminHeader({ title, subtitle, action }) {
  return (
    <div className="admin-page-head">
      <div>
        <h1 className="admin-page-head__title">{title}</h1>
        {subtitle && <p className="admin-page-head__subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
