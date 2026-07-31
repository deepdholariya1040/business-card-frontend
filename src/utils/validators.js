import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Email is required.").email("Enter a valid email address.");

export const registerSendOtpSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: emailSchema,
});

export const otpVerifySchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .min(4, "Enter the code sent to your email.")
    .max(8, "Enter the code sent to your email."),
});

export const loginSendOtpSchema = z.object({
  email: emailSchema,
});

export const userFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: emailSchema,
  companyId: z.string().optional().or(z.literal("")),
  canManageStaff: z.boolean().optional(),
});

export const userEditSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  avatar: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  canManageStaff: z.boolean().optional(),
  scanLimits: z.object({
    daily: z.coerce.number().int().min(0),
    monthly: z.coerce.number().int().min(0),
    yearly: z.coerce.number().int().min(0),
  }),
  customLimits: z.object({
    enabled: z.boolean(),
    daily: z.coerce.number().int().min(0),
    monthly: z.coerce.number().int().min(0),
    yearly: z.coerce.number().int().min(0),
  }),
});

export const companyCreateSchema = z.object({
  name: z.string().trim().min(1, "Company name is required."),
  mainAdminEmail: emailSchema,
  maxCompanyAdmins: z.coerce.number().int().min(1).optional(),
  maxStaff: z.coerce.number().int().min(1).optional(),
  expiryDate: z.string().min(1, "Subscription expiry date is required."),
});

export const companyEditSchema = z.object({
  name: z.string().trim().min(1, "Company name is required."),
  maxCompanyAdmins: z.coerce.number().int().min(1),
  maxStaff: z.coerce.number().int().min(1),
  scanLimits: z.object({
    daily: z.coerce.number().int().min(0),
    monthly: z.coerce.number().int().min(0),
    yearly: z.coerce.number().int().min(0),
  }),
});

export const subscriptionSchema = z.object({
  startDate: z.string().optional().or(z.literal("")),
  expiryDate: z.string().min(1, "Expiry date is required."),
});

export const emailOnlySchema = z.object({
  email: emailSchema,
});

export const businessCardEditSchema = z.object({
  parsedData: z.object({
    name: z.string().optional().or(z.literal("")),
    designation: z.string().optional().or(z.literal("")),
    company: z.string().optional().or(z.literal("")),
    email: z.string().optional().or(z.literal("")),
    website: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
  }),
});
