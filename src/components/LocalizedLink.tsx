import { forwardRef } from 'react'
import {
  Link as RouterLink,
  Navigate as RouterNavigate,
  type LinkProps,
  type NavigateProps,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { localizeInternalPath } from '../utils/localizedRouting'

export const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(function LocalizedLink(
  { to, ...props },
  ref,
) {
  const { i18n } = useTranslation()
  const localizedTo = typeof to === 'string' ? localizeInternalPath(to, i18n.language) : to

  return <RouterLink ref={ref} to={localizedTo} {...props} />
})

export function LocalizedNavigate({ to, ...props }: NavigateProps) {
  const { i18n } = useTranslation()
  const localizedTo = typeof to === 'string' ? localizeInternalPath(to, i18n.language) : to

  return <RouterNavigate to={localizedTo} {...props} />
}
