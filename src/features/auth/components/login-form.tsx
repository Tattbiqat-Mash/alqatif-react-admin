"use client"

import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LockIcon, UserIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FormErrorBanner, FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"
import { useLogin } from "@/features/auth/hooks/use-login"
import { redirectFromLocation } from "@/features/auth/lib/safe-redirect"
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema"

const INVALID_CREDENTIALS = "اسم المستخدم أو كلمة المرور غير صحيحة"

export function LoginForm() {
  const router = useRouter()
  const { signIn } = useAuth()
  const loginMutation = useLogin()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: "", password: "", remember: false },
  })

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(
      { userName: values.userName, password: values.password },
      {
        onSuccess: (session) => {
          signIn(session, values.remember)
          router.replace(redirectFromLocation())
        },
      },
    )
  })

  const error = loginMutation.error
  const serverError = error
    ? error.statusCode === 401 || error.code === "Invalid credentials"
      ? INVALID_CREDENTIALS
      : error.message
    : null
  const pending = loginMutation.isPending || loginMutation.isSuccess

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FormErrorBanner message={serverError} />

      <FormField id="userName" label="اسم المستخدم" error={errors.userName?.message}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            {...register("userName")}
            dir="ltr"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            startIcon={<UserIcon />}
          />
        )}
      </FormField>

      <FormField id="password" label="كلمة المرور" error={errors.password?.message}>
        {(fieldProps) => (
          <PasswordInput
            {...fieldProps}
            {...register("password")}
            autoComplete="current-password"
            startIcon={<LockIcon />}
          />
        )}
      </FormField>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <Checkbox
              id="remember"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        <Label htmlFor="remember" className="text-sm font-normal text-muted-text">
          تذكرني
        </Label>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Spinner />}
        {pending ? "جاري الدخول…" : "دخول"}
      </Button>
    </form>
  )
}
