import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false)

  useEffect(() => {
    const saved = localStorage.getItem('gdark')
    if (saved != null) {
      setDark(saved === '1')
    } else {
      setDark(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('gdark', dark ? '1' : '0')
  }, [dark])

  return (
    <button
      aria-label="Toggle theme"
      className="h-9 w-9 rounded-md border border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? (
        <span className="inline-block">🌙</span>
      ) : (
        <span className="inline-block">☀️</span>
      )}
    </button>
  )
}


