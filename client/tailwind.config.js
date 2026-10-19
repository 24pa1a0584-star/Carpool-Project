/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: '#7046FF',
          orange: '#FF7049',
          lime: '#CCF45B',
          turquoise: '#2DD4BF',
          pink: '#FF6FAE',
          navy: '#11152C',
          ivory: '#FFF9F2',
          lavender: '#F1ECFF',
          sky: '#DDF4FF',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(112, 70, 255, 0.35)',
        'glow-orange': '0 0 25px -5px rgba(255, 112, 73, 0.35)',
        'glow-lime': '0 0 25px -5px rgba(204, 244, 91, 0.4)',
        'card-hover': '0 20px 35px -10px rgba(17, 21, 44, 0.08), 0 10px 15px -8px rgba(112, 70, 255, 0.05)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
