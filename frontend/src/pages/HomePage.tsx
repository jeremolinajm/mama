import HeroSection from '../components/home/HeroSection';
import FeaturedServices from '../components/home/FeaturedServices';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Testimonials from '../components/home/Testimonials';
import MiniBio from '../components/home/MiniBio';

/**
 * Home page
 * Professional landing page with hero, services, products, testimonials, and bio
 */

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedServices />
      <FeaturedProducts />
      <Testimonials />
      <MiniBio />
    </div>
  );
}
