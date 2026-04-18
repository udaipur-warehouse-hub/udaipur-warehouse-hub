import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Udaipur Warehouse Hub — 15,000 Sq Ft Grade-A Warehouse',
  description:
    'Premium 15,000 sq ft warehouse for rent at Gukhar Magri, on NH Golden Quadrilateral, Udaipur, Rajasthan. Loading docks, 24/7 security, power backup, flexible leasing.',
  keywords: [
    'warehouse Udaipur',
    'warehouse for rent',
    'Gukhar Magri warehouse',
    'NH Golden Quadrilateral',
    'storage space Udaipur',
    'distribution center Rajasthan',
  ],
  openGraph: {
    title: 'Udaipur Warehouse Hub — 15,000 Sq Ft Grade-A Warehouse',
    description:
      'Premium warehouse for rent at Gukhar Magri, Udaipur. Loading docks, 24/7 security, power backup.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
