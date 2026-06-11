import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Headline } from '@/features/garmin/insights'

export function InsightBanner({ headline, detail }: Headline) {
  return (
    <Card className="animate-fade-in-up relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            {headline}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
      </div>
    </Card>
  )
}
