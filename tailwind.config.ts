import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: { blue: '#3b82ff', purple: '#a855f7', gold: '#f5c518' },
        ink: { 900: '#05060a', 800: '#0a0c14', 700: '#11141f' }
      },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      boxShadow: {
        glow: '0 0 40px -10px rgba(59,130,255,0.6)',
        'glow-purple': '0 0 40px -10px rgba(168,85,247,0.6)'
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } }
      },
      animation: { floaty: 'floaty 6s ease-in-out infinite', shimmer: 'shimmer 3s linear infinite' }
    }
  },
  plugins: []
};

export default config;
