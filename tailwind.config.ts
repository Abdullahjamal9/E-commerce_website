import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // One extra step above Tailwind's built-in 2xl (1536px) — lets product
      // grids add a column on very wide monitors instead of just stretching
      // the existing four cards across the wider max-width.
      screens: { '3xl': '1920px' },
      colors: {
        // The old neon trio is now one ink tone, so the many
        // `from-neon-blue to-neon-purple` gradients across the app resolve
        // to a flat near-black — the retail-standard button treatment —
        // without touching every component that references them.
        neon: { blue: '#151515', purple: '#151515', gold: '#151515' },
        ink: { 900: '#151515', 800: '#1c1c1c', 700: '#232323' },
        line: '#dad4d0'
      },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      // Page gutter width. Widened from 1440px so ultra-wide monitors
      // (2500px+) don't sit behind large empty side margins, while still
      // stopping short of true edge-to-edge so content doesn't stretch too
      // thin on the widest screens.
      maxWidth: { site: '2560px' },
      boxShadow: {
        glow: '0 1px 2px rgba(21,21,21,0.06)',
        'glow-purple': '0 4px 16px -4px rgba(21,21,21,0.12)'
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        fadeIn: 'fadeIn 0.4s ease'
      }
    }
  },
  plugins: []
};

export default config;
