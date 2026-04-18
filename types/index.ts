export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string
  company_name: string | null
  space_required: string | null
  duration: string | null
  purpose: string | null
  message: string | null
  status: 'new' | 'contacted' | 'negotiating' | 'converted' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GalleryImage {
  id: string
  url: string
  alt_text: string | null
  display_order: number
  created_at: string
}

export interface Feature {
  id: string
  title: string
  description: string | null
  icon: string | null
  display_order: number
  created_at: string
}

export interface SiteSetting {
  key: string
  value: string
  updated_at: string
}

export interface InquiryFormData {
  name: string
  email: string
  phone: string
  company_name?: string
  space_required?: string
  duration?: string
  purpose?: string
  message?: string
}

export interface DashboardStats {
  total_inquiries: number
  new_inquiries: number
  contacted: number
  negotiating: number
  converted: number
  rejected: number
}
