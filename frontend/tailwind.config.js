/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidad Visual "Soft & Glow"
        background: '#F9F7F5', // Crema/Hueso (Fondo Global)
        surface: '#FFFFFF',    // Blanco Puro (Tarjetas, Sidebar)
        
        primary: {
          DEFAULT: '#1A1A1A',  // Negro Suave (Texto Principal)
          light: '#4B5563',    // Gris Oscuro (Subtítulos)
        },
        
        accent: {
          DEFAULT: '#E5989B',  // Rosa Durazno (Botones, Iconos activos)
          hover: '#D08588',    // Rosa un poco más oscuro para hover
          light: '#FCECEC',    // Fondo muy suave para items activos
        },
        
        // Colores de estado (Pasteles para no romper la armonía)
        status: {
          success: '#A7F3D0', // Verde menta suave
          error: '#FECACA',   // Rojo suave
          warning: '#FDE68A', // Amarillo suave
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],           // Para textos largos y UI
        serif: ['Playfair Display', 'serif'],    // Para Títulos H1, H2, H3
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)', // Sombra difusa elegante
      },
      borderRadius: {
        '3xl': '1.5rem', // Bordes extra redondeados para tarjetas
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        }
      }
    },
  },
  plugins: [],
}