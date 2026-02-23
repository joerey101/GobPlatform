import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Brand / sidebar
                'primary': '#2c6bc3',
                'primary-dark': '#1a4d8c',
                'primary-light': '#E3EFFB',
                'gob-blue': '#0A2540',
                'gob-blue-active': '#1A4B8F',
                // Backgrounds
                'background-light': '#f6f7f8',
                'background-dark': '#13181f',
                'surface-dark': '#1e242e',
                // Semantic
                'success': '#16a34a',
                'warning': '#f59e0b',
                'danger': '#dc2626',
                'info': '#0ea5e9',
            },
            fontFamily: {
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
            },
            animation: {
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
        },
    },
    plugins: [],
}

export default config
