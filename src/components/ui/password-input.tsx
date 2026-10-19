"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input, type InputProps } from "@/components/ui/input"

function PasswordInput(props: Omit<InputProps, "type" | "endAdornment">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <Input
      {...props}
      // Stays LTR in both states: `type="text"` would otherwise lose the auto LTR.
      dir="ltr"
      type={visible ? "text" : "password"}
      endAdornment={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      }
    />
  )
}

export { PasswordInput }
