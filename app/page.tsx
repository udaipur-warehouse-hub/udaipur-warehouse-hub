import Hero from '@/components/public/hero'
import Features from '@/components/public/features'
import Stats from '@/components/public/stats'
import Location from '@/components/public/location'
import InquiryForm from '@/components/public/inquiry-form'
import Footer from '@/components/public/footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <Features />
      <Location />
      <InquiryForm />
      <Footer />
    </main>
  )
}
