type BrandLogoProps = {
  variant?: 'header' | 'footer'
}

export function BrandLogo({ variant = 'header' }: BrandLogoProps) {
  return (
    <span className={`brand-logo brand-logo-${variant}`} aria-hidden="true">
      <span>Casa</span>
      <span>Mia</span>
    </span>
  )
}
