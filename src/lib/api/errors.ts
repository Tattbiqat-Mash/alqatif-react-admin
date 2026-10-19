import { isAxiosError } from "axios"

import { messages } from "@/lib/messages"

/** Every failure that reaches the UI. `message` is always Arabic and safe to show. */
export class ApiError extends Error {
  readonly statusCode: number
  /** `errorCode` from the API envelope, e.g. "Invalid credentials". */
  readonly code?: string
  /** Raw API message (often English) — for debugging only, never rendered. */
  readonly serverMessage?: string
  /** ⚠ TBD: the API's field-error format is unknown; filled once confirmed. */
  readonly fieldErrors?: Record<string, string>

  constructor(init: {
    statusCode: number
    message: string
    code?: string
    serverMessage?: string
    fieldErrors?: Record<string, string>
  }) {
    super(init.message)
    this.name = "ApiError"
    this.statusCode = init.statusCode
    this.code = init.code
    this.serverMessage = init.serverMessage
    this.fieldErrors = init.fieldErrors
  }
}

/** Status 0 = no response (network failure, CORS, timeout). */
export const NETWORK_ERROR_STATUS = 0

/** The API's error body: `{ status: "error", message }` or `{ status: "error", errorCode }`. */
export type ApiErrorBody = {
  status: "error"
  message?: string
  errorCode?: string
}

export function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { status?: unknown }).status === "error"
  )
}

const ARABIC_LETTERS = /[؀-ۿ]/

function messageForStatus(statusCode: number): string {
  if (statusCode === NETWORK_ERROR_STATUS) return messages.errors.network
  if (statusCode === 401) return messages.errors.unauthorized
  if (statusCode === 403) return messages.errors.forbidden
  if (statusCode === 404) return messages.errors.notFound
  if (statusCode === 429) return messages.errors.tooManyRequests
  if (statusCode >= 500) return messages.errors.server
  return messages.errors.unexpected
}

export function apiErrorFromBody(statusCode: number, body: ApiErrorBody): ApiError {
  const serverMessage = body.message ?? body.errorCode
  return new ApiError({
    statusCode,
    // Arabic server messages are written for the admin; English ones are not.
    message:
      serverMessage && ARABIC_LETTERS.test(serverMessage)
        ? serverMessage
        : messageForStatus(statusCode),
    code: body.errorCode,
    serverMessage,
  })
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isAxiosError(error)) {
    if (!error.response) {
      return new ApiError({
        statusCode: NETWORK_ERROR_STATUS,
        message:
          error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
            ? messages.errors.timeout
            : messages.errors.network,
        serverMessage: error.message,
      })
    }

    const { status, data } = error.response
    if (isApiErrorBody(data)) return apiErrorFromBody(status, data)
    return new ApiError({ statusCode: status, message: messageForStatus(status) })
  }

  return new ApiError({
    statusCode: NETWORK_ERROR_STATUS,
    message: messages.errors.unexpected,
    serverMessage: error instanceof Error ? error.message : undefined,
  })
}
