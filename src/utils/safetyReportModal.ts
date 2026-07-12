export const safetyReportModalEvent = 'casamia:open-safety-report'

const pendingSafetyReportModalKey = 'casamia-open-safety-report'

export function requestSafetyReportModal() {
  window.sessionStorage.setItem(pendingSafetyReportModalKey, '1')
  window.dispatchEvent(new Event(safetyReportModalEvent))
}

export function consumeSafetyReportModalRequest() {
  if (window.sessionStorage.getItem(pendingSafetyReportModalKey) !== '1') {
    return false
  }

  window.sessionStorage.removeItem(pendingSafetyReportModalKey)
  return true
}
