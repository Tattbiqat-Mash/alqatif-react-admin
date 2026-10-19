"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/errors"

/** Statuses that will not succeed on a retry. */
const NO_RETRY_STATUSES = new Set([400, 401, 403, 404, 422])

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          failureCount < 1 && !(error instanceof ApiError && NO_RETRY_STATUSES.has(error.statusCode)),
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  // One client per browser session; useState keeps it stable across renders.
  const [client] = React.useState(makeQueryClient)
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export { QueryProvider }
