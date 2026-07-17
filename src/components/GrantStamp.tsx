import { useTranslation } from 'react-i18next'

export function GrantStamp() {
  const { t } = useTranslation()
  const label = t('grantStamp.badgeLabel', { defaultValue: 'GRANTS' })
  const shortLine1 = t('grantStamp.shortLine1', { defaultValue: 'UP TO' })
  const stat = t('grantStamp.stat')
  const line2 = t('grantStamp.line2')
  const helper = t('grantStamp.ribbonHelper', { defaultValue: 'Grant filing included' })

  return (
    <div
      className="grant-stamp"
      role="note"
      aria-label={`${label}. ${shortLine1} ${stat} ${line2}. ${helper}`}
    >
      <div className="grant-stamp-inner" aria-hidden="true">
        <span className="grant-stamp-seal">{stat}</span>
        <span className="grant-stamp-copy">
          <span className="grant-stamp-kicker">{label} · {shortLine1}</span>
          <span className="grant-stamp-title">{line2}</span>
          <span className="grant-stamp-subtitle">
            {helper}
          </span>
        </span>
      </div>
    </div>
  )
}
