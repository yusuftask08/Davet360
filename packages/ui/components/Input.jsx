// icon: sol tarafta sabit duran lucide bileşeni (Mail, Lock, User...). endAdornment: sağda
// yüzen bir kontrol (şifre göster/gizle butonu gibi) — ikisi de opsiyonel, verildiğinde
// input'un padding'i CSS tarafında (.ui-field__control--icon/--end) otomatik ayarlanır.
export function Input({ label, error, id, className = '', icon: Icon, endAdornment, ...props }) {
  return (
    <div className="ui-field">
      {label && (
        <label htmlFor={id} className="ui-field__label">
          {label}
        </label>
      )}
      <div
        className={`ui-field__control${Icon ? ' ui-field__control--icon' : ''}${
          endAdornment ? ' ui-field__control--end' : ''
        }`}
      >
        {Icon && <Icon size={18} strokeWidth={1.75} className="ui-field__icon" aria-hidden="true" />}
        <input id={id} className={`ui-input ${className}`.trim()} {...props} />
        {endAdornment && <span className="ui-field__end">{endAdornment}</span>}
      </div>
      {error && <span className="ui-field__error">{error}</span>}
    </div>
  );
}
