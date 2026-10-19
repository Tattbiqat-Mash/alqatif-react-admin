import { useMutation } from "@tanstack/react-query"

import { login } from "@/features/auth/api/auth.api"
import type { LoginValues, Session } from "@/features/auth/types/auth.types"
import type { ApiError } from "@/lib/api/errors"

export function useLogin() {
  return useMutation<Session, ApiError, Pick<LoginValues, "userName" | "password">>({
    mutationFn: login,
  })
}
