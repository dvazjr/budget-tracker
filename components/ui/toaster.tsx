"use client"

import * as React from "react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

export function Toaster() {
  const [toasts, setToasts] = React.useState<any[]>([])

  React.useEffect(() => {
    const removeToast = (toastId: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    }

    window.addEventListener("toast", (event: any) => {
      const toast = event.detail
      toast.id = Math.random().toString()
      setToasts((prev) => [...prev, toast])

      setTimeout(() => removeToast(toast.id), 5000)
    })
  }, [])

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast key={toast.id}>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
