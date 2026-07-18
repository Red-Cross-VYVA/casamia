import { handlePublicReportPost } from '../_lib/public-reports.js'

export default async function handler(request, response) {
  await handlePublicReportPost(request, response, 'grant_report')
}
