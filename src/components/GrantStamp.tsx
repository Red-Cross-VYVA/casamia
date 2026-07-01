import { useTranslation } from 'react-i18next'

export function GrantStamp() {
  const { t } = useTranslation()
  const line1 = t('grantStamp.line1')
  const stat = t('grantStamp.stat')
  const line2 = t('grantStamp.line2')
  const helper = t('grantStamp.helper', { defaultValue: 'We handle the filing.' })
  const badgeHelper = t('grantStamp.badgeHelper', {
    defaultValue: 'Filing included',
  })

  return (
    <div
      className="grant-stamp"
      role="note"
      aria-label={`${line1} ${stat} ${line2}. ${helper}`}
    >
      <div className="grant-stamp-inner" aria-hidden="true">
        <span className="grant-stamp-copy">
          <span className="grant-stamp-title">
            {line1} {stat}
          </span>
          <span className="grant-stamp-subtitle">
            {line2} + {badgeHelper}
          </span>
        </span>
        <span className="grant-stamp-seal">%</span>
      </div>
    </div>
  )
}
