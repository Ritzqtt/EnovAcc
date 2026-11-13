/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          sky: 'var(--brand-sky)',
          azure: 'var(--brand-azure)',
          ocean: 'var(--brand-ocean)',
          royal: 'var(--brand-royal)',
          navy: 'var(--brand-navy)',
          action: '#05508F',
          'action-hover': '#0A5FA4',
          'action-border': '#2E7DB8',
          cash: '#0E90C7',
          muted: '#7A8794',
        },
      },
      backgroundImage: {
        'hero-gradient': 'var(--hero-gradient)',
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, -8px, 0)' },
          '50%': { transform: 'translate3d(0, 8px, 0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        progress: {
          from: { width: '0%' },
          to: { width: 'var(--progress-width)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        progress: 'progress 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both',
      },
      boxShadow: {
        'glass-panel':
          'inset 0 1px 0 0 rgba(255, 255, 255, 0.24), 0 40px 90px -30px rgba(1, 22, 49, 0.55)',
      },
    },
  },
  plugins: [],
}
