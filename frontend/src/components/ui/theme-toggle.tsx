import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Read the initial theme synchronously so it matches the no-flash script in index.html. */
function initialDark(): boolean {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark')
  }
  return true
}

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(initialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('gdark', dark ? '1' : '0')
  }, [dark])

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      title={dark ? 'Switch to light' : 'Switch to dark'}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Moon /> : <Sun />}
    </Button>
  )
}
