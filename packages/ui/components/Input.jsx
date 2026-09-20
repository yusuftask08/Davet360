export function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className="ui-field">
      {label && (
        <label htmlFor={id} className="ui-field__label">
          {label}
        </label>
      )}
      <input id={id} className={`ui-input ${className}`.trim()} {...props} />
      {error && <span className="ui-field__error">{error}</span>}
    </div>
  );
}
