'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Select from '@/components/ui/select'

const spaceOptions = [
  { value: 'full', label: 'Full Warehouse (15,000 sq ft)' },
  { value: '10000', label: '10,000 sq ft' },
  { value: '7500', label: '7,500 sq ft' },
  { value: '5000', label: '5,000 sq ft' },
  { value: '2500', label: '2,500 sq ft' },
  { value: 'custom', label: 'Custom requirement' },
]

const durationOptions = [
  { value: '3months', label: '3 Months' },
  { value: '6months', label: '6 Months' },
  { value: '1year', label: '1 Year' },
  { value: '2years', label: '2 Years' },
  { value: '3years+', label: '3+ Years' },
  { value: 'flexible', label: 'Flexible' },
]

const purposeOptions = [
  { value: 'storage', label: 'Storage & Warehousing' },
  { value: 'distribution', label: 'Distribution Center' },
  { value: 'manufacturing', label: 'Light Manufacturing' },
  { value: 'ecommerce', label: 'E-commerce Fulfillment' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'other', label: 'Other' },
]

export default function InquiryForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company_name: formData.get('company_name') as string,
      space_required: formData.get('space_required') as string,
      duration: formData.get('duration') as string,
      purpose: formData.get('purpose') as string,
      message: formData.get('message') as string,
    }

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section id="inquiry" className="py-24 px-6 bg-slate-800/30">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-4 bg-green-500/10 rounded-2xl w-fit mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Inquiry Submitted!</h2>
          <p className="text-slate-400 text-lg">
            Thank you for your interest. We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="inquiry" className="py-24 px-6 bg-slate-800/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Interested? Get in Touch
          </h2>
          <p className="text-slate-400 text-lg">
            Fill out the form below and we&apos;ll contact you within 24 hours
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              id="name"
              name="name"
              label="Full Name *"
              placeholder="Your full name"
              required
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email *"
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number *"
              placeholder="+91 XXXXXXXXXX"
              required
            />
            <Input
              id="company_name"
              name="company_name"
              label="Company Name"
              placeholder="Your company"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Select
              id="space_required"
              name="space_required"
              label="Space Required"
              options={spaceOptions}
            />
            <Select
              id="duration"
              name="duration"
              label="Lease Duration"
              options={durationOptions}
            />
            <Select
              id="purpose"
              name="purpose"
              label="Purpose"
              options={purposeOptions}
            />
          </div>

          <Textarea
            id="message"
            name="message"
            label="Additional Details"
            placeholder="Tell us more about your requirements..."
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Submit Inquiry
          </Button>
        </form>
      </div>
    </section>
  )
}
