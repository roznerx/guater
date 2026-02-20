import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Blues
        blue: {
          pale:  '#C8DCEE',
          light: '#7FB8D8',
          mid:   '#3E8FC0',
          core:  '#1A6FA0',
          deep:  '#0D4F78',
        },
        // Teals
        teal: {
          light: '#8DCFCA',
          core:  '#2AABA2',
          deep:  '#1A7A74',
        },
        // Neutrals
        surface:  '#F4F8FB',
        border:   '#DDE8F0',
        slate: {
          soft: '#E8EEF4',
          mid:  '#94A8BA',
          deep: '#4A6070',
        },
        // Text
        text: {
          primary:   '#0F2A3A',
          secondary: '#4A6070',
          muted:     '#94A8BA',
        },
        // Status
        status: {
          success: '#2AABA2',
          warning: '#E8A230',
          error:   '#D95F5F',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config