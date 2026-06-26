"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(10, 10, 10, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#fff",
            borderRadius: "1rem",
            padding: "14px 16px",
            fontSize: "0.875rem",
            fontWeight: "500",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
          },
          success: {
            style: {
              borderLeft: "4px solid #10B981",
              background: "rgba(10, 10, 10, 0.75)",
            }
          },
          error: {
            style: {
              borderLeft: "4px solid #EF4444",
              background: "rgba(10, 10, 10, 0.75)",
            }
          },
          info: {
            style: {
              borderLeft: "4px solid #7342E2",
              background: "rgba(10, 10, 10, 0.75)",
            }
          },
        }}
        closeButton
      />
    </ThemeProvider>
  )
}
