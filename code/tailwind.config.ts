// tailwind.config.ts — KIRA neon-shōnen theme
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#050507',
          1: '#0c0c10',
          2: '#16161c',
          3: '#1f1f27',
        },
        line: 'rgba(255,255,255,0.08)',
        'line-strong': 'rgba(255,255,255,0.14)',
        text: {
          DEFAULT: '#f5f5f7',
          dim: 'rgba(245,245,247,0.72)',
          muted: 'rgba(245,245,247,0.48)',
          faint: 'rgba(245,245,247,0.28)',
        },
        // Neon accents
        hot: { DEFAULT: '#ff1f6d', 2: '#ff2d55', deep: '#cc0044' },
        gold: '#ffd400',
        jade: '#1ff39d',
        ice: '#5ec8ff',
        violet: '#b855ff',
        ink: '#e8e6e0',
        paper: '#f0ece2',
      },
      fontFamily: {
        hit: ['var(--font-hit)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        jp: ['var(--font-jp)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        hot: '0 0 24px rgba(255,31,109,0.55), 0 0 60px rgba(255,31,109,0.25)',
        'hot-soft': '0 0 12px rgba(255,31,109,0.35)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px rgba(0,0,0,0.5)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pulse2: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
        pulse2: 'pulse2 1.6s ease-in-out infinite',
      },
    },
  },
};
export default config;
