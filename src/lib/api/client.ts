import axios, { type AxiosProgressEvent, type AxiosRequestConfig } from "axios"

import { env } from "@/config/env"
import { apiErrorFromBody, isApiErrorBody, toApiError } from "@/lib/api/errors"

/** A value the API accepts in a form-urlencoded body. Arrays are sent comma-separated. */
export type BodyValue = string | number | boolean | null | undefined | ReadonlyArray<string | number>
export type FormBody = Record<string, BodyValue>

type RequestOptions = {
  /** Do not end the session on 401 (used by login, where 401 means wrong credentials). */
  skipAuthRedirect?: boolean
  signal?: AbortSignal
}

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRedirect?: boolean
  }
}

let getToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}

/** Registered by the auth provider (Task 02). */
export function setAuthTokenGetter(getter: () => string | null) {
  getToken = getter
}

/** Registered by the auth provider (Task 02): clears the session and goes to /login. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

/** `{ a: 1, ok: true, ids: [1, 2], skip: undefined }` → `a=1&ok=1&ids=1,2` */
export function toFormBody(body: FormBody): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue
    if (typeof value === "boolean") params.append(key, value ? "1" : "0")
    else if (Array.isArray(value)) params.append(key, value.join(","))
    else params.append(key, String(value))
  }
  return params
}

const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
  headers: { Accept: "application/json" },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.set("Authorization", `Bearer ${token}`)
  return config
})

http.interceptors.response.use(
  (response) => {
    // The API sometimes labels JSON as text/html; parse it ourselves if axios did not.
    let data: unknown = response.data
    if (typeof data === "string" && data.trim() !== "") {
      try {
        data = JSON.parse(data)
      } catch {
        // Not JSON — leave as is.
      }
    }
    // ⚠ TBD whether the API ever sends `{ status: "error" }` with HTTP 200; treat it as an error anyway.
    if (isApiErrorBody(data)) throw apiErrorFromBody(response.status, data)
    response.data = data
    return response
  },
  (error: unknown) => {
    const apiError = toApiError(error)
    const skip = axios.isAxiosError(error) && error.config?.skipAuthRedirect
    if (apiError.statusCode === 401 && !skip) onUnauthorized()
    return Promise.reject(apiError)
  },
)

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await http.request<T>(config)
    return response.data
  } catch (error) {
    // Both interceptors already reject with ApiError; this only guards against anything else.
    throw toApiError(error)
  }
}

export function apiGet<T>(url: string, options: RequestOptions = {}): Promise<T> {
  return request<T>({ method: "GET", url, ...options })
}

export function apiPost<T>(url: string, body: FormBody = {}, options: RequestOptions = {}): Promise<T> {
  return request<T>({
    method: "POST",
    url,
    data: toFormBody(body),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    ...options,
  })
}

export function apiUpload<T>(
  url: string,
  formData: FormData,
  options: RequestOptions & { onProgress?: (percent: number) => void } = {},
): Promise<T> {
  const { onProgress, ...rest } = options
  return request<T>({
    method: "POST",
    url,
    data: formData,
    onUploadProgress: onProgress
      ? (event: AxiosProgressEvent) => {
          if (event.total) onProgress(Math.round((event.loaded / event.total) * 100))
        }
      : undefined,
    ...rest,
  })
}
