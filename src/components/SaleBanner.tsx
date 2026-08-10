import Image from 'next/image';
import Link from 'next/link';
import desktopBanner from '@/assets/indpendence_day.png';
import mobileBanner from '@/assets/mobile_independence.png';

/** Independence Day (14 Aug) promo — admin-designed artwork, shown only while the homepage banner is enabled in Settings. */
export default function SaleBanner() {
  return (
    // data-header-backdrop lets the transparent header sample the artwork it
    // sits on and flip its own text between black and white.
    <Link href="/shop" className="relative block w-full" data-header-backdrop>
      {/* The mobile artwork is 2:3 portrait — at full width it eats the whole
          phone screen, so cap the height and let object-cover trim the
          decorative top/bottom edges rather than the headline. */}
      <Image
        src={mobileBanner}
        alt="14th August Independence Day — up to 50% off sitewide"
        priority
        className="block max-h-[58vh] w-full object-cover object-center md:hidden"
      />
      <Image
        src={desktopBanner}
        alt="14th August Independence Day — up to 50% off sitewide"
        priority
        className="hidden h-auto w-full md:block"
      />
    </Link>
  );
}
