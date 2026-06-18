import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(1, "Şifre gereklidir"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır").max(100),
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  workspaceName: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token gereklidir"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
})

export const workspaceSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır").max(100),
})

export const projectSchema = z.object({
  name: z.string().min(2, "Proje adı en az 2 karakter olmalıdır").max(100),
})

export const smtpSchema = z.object({
  name: z.string().min(2).max(100),
  provider: z.enum(["gmail", "brevo", "mailgun", "ses", "resend", "custom"]),
  host: z.string().min(1, "SMTP host gereklidir"),
  port: z.coerce.number().default(587),
  secure: z.boolean().default(false),
  username: z.string().min(1, "Kullanıcı adı gereklidir"),
  password: z.string().min(1, "Şifre gereklidir"),
  fromEmail: z.string().email(),
  isPrimary: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type WorkspaceInput = z.infer<typeof workspaceSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type SmtpInput = z.infer<typeof smtpSchema>
