/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3F1E4',
        card: '#FBFAF3',
        ink: '#2B2E23',
        'ink-soft': '#6B6A57',
        sage: {
          light: '#9BAE8B',
          DEFAULT: '#6B8259',
          dark: '#3E5233'
        },
        clay: '#C08A3E',
        line: '#DAD8C4'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        card: '18px'
      }
    }
  },
  plugins: []
};
