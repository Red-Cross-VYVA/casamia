import { handlePublicReportGet } from '../../_lib/public-reports.js'

export default async function handler(request, response) {
  await handlePublicReportGet(request, response, 'grant_report')
}
