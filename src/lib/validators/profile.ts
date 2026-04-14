import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
});

export const updateEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
