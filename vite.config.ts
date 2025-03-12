import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

console.log('VITE_OPENAI_API_KEY:', process.env.VITE_OPENAI_API_KEY); // This will be undefined in build

export default defineConfig({
  plugins: [react()],
})