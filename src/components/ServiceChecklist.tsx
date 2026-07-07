import { CheckCircle2 } from 'lucide-react'

type ServiceChecklistProps = {
  items: string[]
}

export function ServiceChecklist({ items }: ServiceChecklistProps) {
  return (
    <ul className="seo-check-list">
      {items.map((item) => (
        <li key={item}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
