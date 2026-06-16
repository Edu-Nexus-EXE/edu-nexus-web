export type DashboardTone = 'primary' | 'info' | 'success' | 'warning' | 'accent' | 'destructive'

type DashboardToneStyles = {
  card: string
  icon: string
  badge: string
  solid: string
  text: string
  dot: string
}

export const DASHBOARD_TONE_STYLES: Record<DashboardTone, DashboardToneStyles> = {
  primary: {
    card: 'bg-primary/5 border-primary/10 hover:border-primary/30',
    icon: 'bg-primary/10 text-primary',
    badge: 'bg-primary/10 text-primary',
    solid: 'bg-primary text-primary-foreground',
    text: 'text-primary',
    dot: 'bg-primary'
  },
  info: {
    card: 'bg-info/5 border-info/10 hover:border-info/30',
    icon: 'bg-info/10 text-info',
    badge: 'bg-info/10 text-info',
    solid: 'bg-info text-info-foreground',
    text: 'text-info',
    dot: 'bg-info'
  },
  success: {
    card: 'bg-success/5 border-success/10 hover:border-success/30',
    icon: 'bg-success/10 text-success',
    badge: 'bg-success/10 text-success',
    solid: 'bg-success text-success-foreground',
    text: 'text-success',
    dot: 'bg-success'
  },
  warning: {
    card: 'bg-warning/5 border-warning/10 hover:border-warning/30',
    icon: 'bg-warning/10 text-warning',
    badge: 'bg-warning/10 text-warning',
    solid: 'bg-warning text-warning-foreground',
    text: 'text-warning',
    dot: 'bg-warning'
  },
  accent: {
    card: 'bg-accent/20 border-accent/40 hover:border-accent/60',
    icon: 'bg-accent text-accent-foreground',
    badge: 'bg-accent/30 text-accent-foreground',
    solid: 'bg-accent text-accent-foreground',
    text: 'text-accent-foreground',
    dot: 'bg-accent'
  },
  destructive: {
    card: 'bg-destructive/5 border-destructive/20 hover:border-destructive/30',
    icon: 'bg-destructive/10 text-destructive',
    badge: 'bg-destructive/10 text-destructive',
    solid: 'bg-destructive text-destructive-foreground',
    text: 'text-destructive',
    dot: 'bg-destructive'
  }
}
