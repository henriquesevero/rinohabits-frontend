import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface CollectionAutocompleteProps {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder?: string
  className?: string
}

export function CollectionAutocomplete({
  value,
  onChange,
  suggestions,
  placeholder = 'Coleção / série (opcional)',
  className = '',
}: CollectionAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value,
  )

  const showDropdown = open && filtered.length > 0

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleFocus() {
    if (inputRef.current) {
      setRect(inputRef.current.getBoundingClientRect())
    }
    setOpen(true)
  }

  return (
    <>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {showDropdown && rect &&
        createPortal(
          <ul
            style={{
              position: 'fixed',
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-900"
          >
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onChange(s)
                    setOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-black/80 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/8"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  )
}
