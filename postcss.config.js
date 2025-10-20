import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer'; // Mantendo autoprefixer para compatibilidade

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
  ],
};