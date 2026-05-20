/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '1.5rem',
                lg: '2rem',
            },
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563eb',
                    600: '#1d4ed8'
                },
                muted: {
                    DEFAULT: '#6b7280'
                }
            },
            boxShadow: {
                'card': '0 8px 30px rgba(17,24,39,0.08)'
            },
            borderRadius: {
                'xl-2': '1rem'
            }
        },
    },
    plugins: [],
}