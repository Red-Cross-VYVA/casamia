import type { IncomingMessage, ServerResponse } from 'node:http'

type ApiResponse = ServerResponse & {
  status: (statusCode: number) => ServerResponse
}

declare function analyseSafetyPhotoHandler(request: IncomingMessage, response: ApiResponse): Promise<void>

export default analyseSafetyPhotoHandler
