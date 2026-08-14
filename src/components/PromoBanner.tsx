import Image from 'next/image';
import Link from 'next/link';
import desktopBanner from '@/assets/image2.png';
import mobileBanner from '@/assets/image4.png';

/**
 * Homepage banner. The artwork carries its own headline, supporting line and
 * feature icons; the only live element is the call to action, dropped into a
 * gap the design leaves clear for it.
 *
 * Two crops of the campaign, each with the button placed against its own
 * composition: the landscape one from md up, the portrait one on phones.
 * Everything is sized in `cqw` — percentages of the banner's own width — so
 * the button holds its place as the artwork scales rather than drifting out
 * of the gap it was put in.
 */
export default function PromoBanner() {
  return (
    <section
      aria-label="Step into a bolder tomorrow"
      // Lets the see-through desktop header read the artwork it sits on.
      data-header-backdrop
      className="relative isolate w-full overflow-hidden bg-[#060608] [container-type:inline-size]"
    >
      {/* Phones: the portrait cut. This artwork carries a deep empty margin
          above its headline (323 of 1774 rows) — plenty to crop away and still
          clear the header, unlike the previous crop's source, which barely
          had enough and needed a few px of padding on top of it. This one
          needs none: cropping 120 rows off the top leaves ~200px of margin
          above "Step into a", comfortably below the header at every phone
          width. */}
      <div className="relative md:hidden">
        <div className="relative aspect-[887/1654] w-full">
          <Image
            src={mobileBanner}
            alt="Step into a bolder tomorrow"
            priority
            fill
            sizes="100vw"
            className="object-cover object-bottom"
          />
          {/* The artwork has a stray mark baked into it just before the "I" in
              "Into" — no image editor at hand to paint it out at the source,
              so a small patch in the same near-black tone sits over it
              instead. The mark itself is only ~2 source px wide (x≈219-221 of
              887); this box is padded out to x=214-227, comfortably inside
              the gap between "P" (ending ~198) and "I" (starting ~231) so it
              can't cut into either letter. Positioned in source-pixel
              percentages of this crop (887 wide, 1654 tall after the top
              trim above). */}
          <div
            aria-hidden
            className="absolute rounded-sm bg-[#020102]"
            style={{ left: '24.1%', top: '12%', width: '1.5%', height: '1%' }}
          />
        </div>

        {/* The sole's ink stops at 76.9% down this crop, and the icon row
            starts at 86.6% — only 9.7% of the banner's height between them.
            The button (padding included) barely fits that band on its own; a
            5cqw glow (the desktop button's size) would bleed into the sole or
            the icons regardless of centring, so it's cut down to 1.5cqw here
            and the padding trimmed a little to leave real breathing room on
            both sides rather than just relocating the collision. */}
        <Link
          href="/shop"
          className="group absolute left-1/2 top-[79%] inline-flex -translate-x-1/2 items-center gap-[1.8cqw] rounded-full bg-gradient-to-r from-[#1257ff] to-[#2f7bff] px-[6cqw] py-[2.8cqw] text-[3.2cqw] font-bold uppercase leading-none tracking-[0.12em] text-white shadow-[0_0_1.5cqw_rgba(27,92,255,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Shop now
          <svg viewBox="0 0 24 24" aria-hidden className="h-[3.2cqw] w-[3.2cqw]">
            <path
              d="M9 5l7 7-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* md and up: the landscape cut. The artwork carries a deep empty margin
          above its headline, which the floating header then sits in the middle
          of. Anchoring to the bottom crops that margin away rather than the
          composition — 80 of the 941 rows, and 110 from xl up.
          The header's 80px never scales, but the artwork does, so a single
          crop that clears the headline on a wide screen would crowd it on a
          narrow one. Taking more only where there is slack keeps that gap
          roughly even instead. */}
      <div className="relative hidden aspect-[1672/861] w-full md:block xl:aspect-[1672/831]">
        <Image
          src={desktopBanner}
          alt="Step into a bolder tomorrow"
          priority
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />

        {/* The band the artwork leaves clear between the copy (ink ends at row
            601 of 941) and the icon row (starts at 727), expressed against
            each crop. The button is centred inside it rather than pinned to a
            top offset: its height stops shrinking with the artwork once the
            tap-target floors below take over, and a fixed top then walks it
            down into the icons on a tablet. Centring splits whatever room is
            left evenly. */}
        <div className="absolute inset-x-0 top-[60.5%] bottom-[24.9%] flex items-center pl-[7.2%] xl:top-[59.1%] xl:bottom-[25.8%]">
          <div className="relative">
            {/* The light streak running into the button's left edge. */}
            <span
              aria-hidden
              className="absolute right-full top-1/2 h-[0.16cqw] w-[3.6cqw] -translate-y-1/2 bg-gradient-to-l from-[#6ea3ff] to-transparent"
            />
            {/* Floors on every size: pure cqw would shrink this to a 24px-tall
                target on a tablet, which is under any reasonable tap size. The
                floors only bite below roughly 1150px — wider than that the
                artwork's own scale takes over. */}
            <Link
              href="/shop"
              className="group inline-flex items-center gap-[max(6px,0.7cqw)] rounded-full bg-gradient-to-r from-[#1257ff] to-[#2f7bff] px-[max(20px,2.6cqw)] py-[max(10px,1cqw)] text-[max(11px,1.05cqw)] font-bold uppercase leading-none tracking-[0.12em] text-white shadow-[0_0_1.6cqw_rgba(27,92,255,0.45)] transition hover:from-[#1a63ff] hover:to-[#4d8bff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shop now
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="h-[max(11px,1.1cqw)] w-[max(11px,1.1cqw)] transition group-hover:translate-x-[0.25cqw]"
              >
                <path
                  d="M9 5l7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
