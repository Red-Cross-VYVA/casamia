import {
  ArrowUpDown,
  Bath,
  BookOpen,
  CheckCircle2,
  CookingPot,
  DoorOpen,
  Home,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

import type { ServiceIconId } from '../constants/siteContent'

const serviceIconMap: Record<ServiceIconId, LucideIcon> = {
  bath: Bath,
  book: BookOpen,
  check: CheckCircle2,
  door: DoorOpen,
  home: Home,
  kitchen: CookingPot,
  light: Lightbulb,
  shield: ShieldCheck,
  smartphone: Smartphone,
  stairs: ArrowUpDown,
}

type ServiceIconProps = {
  icon: ServiceIconId
  size?: number
  className?: string
}

export function ServiceIcon({ icon, size = 24, className }: ServiceIconProps) {
  const Icon = serviceIconMap[icon]

  return <Icon size={size} className={className} aria-hidden="true" />
}
