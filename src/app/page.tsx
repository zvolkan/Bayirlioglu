import type { Metadata } from 'next'
import { BRAND } from '@/lib/constants'
import HeroSection from '@/components/home/HeroSection'
import BrandCards from '@/components/home/BrandCards'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import WhyUs from '@/components/home/WhyUs'
import ServicesSection from '@/components/home/ServicesSection'
import Testimonials from '@/components/home/Testimonials'
import BlogPreview from '@/components/home/BlogPreview'
import NewsletterCTA from '@/components/home/NewsletterCTA'

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.description,
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandCards />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyUs />
      <ServicesSection />
      <Testimonials />
      <BlogPreview />
      <NewsletterCTA />
    </>
  )
}
