/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--navy)',
        blue: 'var(--blue)',
        green: 'var(--green)',
        gold: 'var(--gold)',
        'light-blue': 'var(--light-blue)',
        'pale-blue': 'var(--pale-blue)',
        'text-dark': 'var(--text-dark)',
        'text-mid': 'var(--text-mid)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        ink: 'var(--ink)',
        'navy-mid': 'var(--navy-mid)',
        'navy-dark': 'var(--navy-dark)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      maxWidth: {
        site: '1440px',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(13, 30, 46, 0.12)',
      },
    },
  },
  plugins: [],
}
