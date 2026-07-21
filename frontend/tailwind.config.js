/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1F1D',
          900: '#13302C',
          700: '#2A4B45',
          500: '#4A6E67',
          300: '#8FA9A3',
        },
        clinical: {
          950: '#052E2B',
          900: '#0A4A46',
          700: '#0F6B65',
          500: '#178077',
          300: '#5FA89F',
          100: '#D7EAE7',
          50: '#EFF6F5',
        },
        vital: {
          700: '#C1442F',
          500: '#E8734A',
          300: '#F2A583',
          100: '#FBE6DA',
        },
        signal: {
          success: '#2F8F5B',
          successBg: '#E4F4EB',
          warning: '#B4790F',
          warningBg: '#FBF0DC',
          danger: '#C1443A',
          dangerBg: '#FBE6E4',
          info: '#2A5FA0',
          infoBg: '#E4EDF8',
        },
        paper: '#F7F9F8',
        line: '#DCE4E2',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,31,29,0.06), 0 4px 16px rgba(11,31,29,0.05)',
        pop: '0 8px 30px rgba(11,31,29,0.12)',
      },
    },
  },
  plugins: [],
};
