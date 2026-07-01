import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type SafeImageProps = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  fallbackLabel?: string
}

export function SafeImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackLabel,
}: SafeImageProps) {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)

  return (
    <div className={className}>
      {failed ? (
        <div className="image-fallback">{fallbackLabel ?? t('common.imageFallback')}</div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={imgClassName}
          loading="eager"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
