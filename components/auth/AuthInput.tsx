type AuthInputProps = {
  id: string
  label: string
  type: 'email' | 'password' | 'text'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
  autoComplete?: string
}

export const AuthInput = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete,
}: AuthInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        tabIndex={0}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

