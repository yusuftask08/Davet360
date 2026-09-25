// Sayfa başlığı — gezinme ve çıkış artık layout'taki PanelShell'de. Başlık ve isteğe bağlı
// sağdaki eylem (ör. "İlanımı Düzenle") aynı satırda, mobilde alt alta.
export function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="panel-page-head">
      <div>
        <h1 className="panel-page-head__title">{title}</h1>
        {subtitle && <p className="panel-page-head__subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
