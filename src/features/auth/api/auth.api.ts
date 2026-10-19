import { endpoints } from "@/config/endpoints"
import { apiPost } from "@/lib/api/client"
import { ApiError } from "@/lib/api/errors"
import { jwtExpiresAt } from "@/lib/auth/jwt"
import type { AdminDto, LoginResponseDto } from "@/features/auth/types/auth.dto"
import {
  ADMIN_PERMISSIONS,
  type Admin,
  type AdminPermission,
  type LoginValues,
  type Session,
} from "@/features/auth/types/auth.types"

function toFlag(value: unknown): boolean {
  return value === true || value === 1 || value === "1"
}

/** Maps an admin record. `password` and the other unused fields are dropped here. */
export function mapAdmin(dto: AdminDto): Admin {
  const type = Number(dto.type)
  return {
    id: dto.id,
    userName: dto.userName,
    displayName: dto.displayName?.trim() || dto.userName,
    email: dto.email?.trim() || null,
    // The API has no avatar field; the UI shows the first letter instead.
    avatarUrl: null,
    type: type === 0 || type === 1 ? type : null,
    // Flags are `null` for full admins (type 0); `can()` grants them everything.
    permissions: Object.fromEntries(
      ADMIN_PERMISSIONS.map((flag) => [flag, toFlag(dto[flag])]),
    ) as Record<AdminPermission, boolean>,
  }
}

function isLoginResponse(raw: unknown): raw is LoginResponseDto {
  if (typeof raw !== "object" || raw === null) return false
  const r = raw as Partial<LoginResponseDto>
  return (
    typeof r.token === "string" &&
    r.token !== "" &&
    typeof r.data === "object" &&
    r.data !== null &&
    typeof r.data.userName === "string"
  )
}

export function mapLoginResponse(raw: unknown): Session {
  if (!isLoginResponse(raw)) {
    throw new ApiError({
      statusCode: 200,
      message: "تعذر قراءة رد تسجيل الدخول من الخادم. تواصل مع الدعم الفني.",
      serverMessage: "Unexpected login response shape (see rules/api-samples/auth-login.json).",
    })
  }
  return {
    token: raw.token,
    admin: mapAdmin(raw.data),
    expiresAt: jwtExpiresAt(raw.token),
  }
}

export async function login({ userName, password }: Pick<LoginValues, "userName" | "password">) {
  // 401 here means wrong credentials, not an expired session.
  const raw = await apiPost<unknown>(
    endpoints.auth.login,
    { userName, password },
    { skipAuthRedirect: true },
  )
  return mapLoginResponse(raw)
}
