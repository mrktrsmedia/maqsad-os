import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'os-bg':           '#0a0a0b',
        'os-surface':      '#111114',
        'os-surface2':     '#17171c',
        'os-border':       '#222228',
        'os-border-bright':'#333340',
        'os-text':         '#e8e6e0',
        'os-text-muted':   '#5a5865',
        'os-text-dim':     '#3a3845',
        'os-accent':       '#c8a97e',
        'os-accent-dim':   '#6b5840',
        'os-accent-glow':  'rgba(200,169,126,0.12)',
        'os-red':          '#d45c5c',
        'os-green':        '#5cb88a',
        'os-blue':         '#5c8fd4',
        'os-purple':       '#9b6fd4',
        'os-gold':         '#d4a044',
        'os-warn':         '#d47c3a',
      },
      fontFamily: {
        mono:     ['DM Mono', 'monospace'],
        syne:     ['Syne', 'sans-serif'],
        fraunces: ['Fraunces', 'serif'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
}

export default config
