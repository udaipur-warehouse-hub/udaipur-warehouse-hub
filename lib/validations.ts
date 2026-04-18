import { z } from 'zod'

export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  company_name: z.string().optional().default(''),
  space_required: z.string().optional().default(''),
  duration: z.string().optional().default(''),
  purpose: z.string().optional().default(''),
  message: z.string().optional().default(''),
})

export type InquiryInput = z.infer<typeof inquirySchema>
