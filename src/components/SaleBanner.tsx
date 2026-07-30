import Image from 'next/image';
import Link from 'next/link';
import desktopBanner from '@/assets/indpendence_day.png';
import mobileBanner from '@/assets/mobile_independence.png';

/** Independence Day (14 Aug) promo — admin-designed artwork, shown only while the homepage banner is enabled in Settings. */
export default function SaleBanner() {
  return (
    <Link href="/shop" className="relative block w-full">
      <Image
        src={mobileBanner}
        alt="14th August Independence Day — up to 50% off sitewide"
        priority
        className="block h-auto w-full md:hidden"
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
