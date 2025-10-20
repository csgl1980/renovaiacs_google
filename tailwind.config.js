/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cs-blue': '#1A4370', // Azul Veleiro Oceânico
        'cs-gray': '#A0A0A0', // Cinza Patativa
        'cs-orange': '#FF8C00', // Laranja
        // Mantendo os tons de indigo e amber para componentes que já os usam e podem ser mapeados
        // ou para uso futuro, mas priorizando os novos.
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3', // Este será o tom principal para o azul da C&S
          900: '#312e81',
          950: '#1e1b4b',
        },
        amber: {
          50: '#fffbeb',
          100: '#fff3cd',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
    },
  },
  plugins: [],
}