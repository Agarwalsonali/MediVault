// Enhanced Input — uses MediVault design system CSS classes from index.css
function Input({ label, name, type = 'text', value, onChange, placeholder = '', autoComplete, error, icon, hint }) {
  return (
    <div className="mv-form-group">
      {label && <label htmlFor={name} className="mv-label">{label}</label>}
      <div className={icon ? 'mv-input-wrap' : ''}>
        {icon && <span className="mv-input-icon">{icon}</span>}
        <input
          id={name} name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          className={`mv-input${error ? ' error' : ''}`}
        />
      </div>
      {hint && !error && <p className="mv-field-hint">{hint}</p>}
      {error && (
        <p className="mv-field-error">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
