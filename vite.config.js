import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/', // Configurado a '/' para despliegues en la raíz de Cloud Run
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
    server: {
        host: true, // Permite que el servidor sea accesible desde fuera del contenedor
        port: 3000,
    },
    define: {
        // Inyecta process.env.API_KEY desde el entorno de construcción en el bundle del cliente.
        // Esto es necesario para que process.env.API_KEY esté disponible en el navegador.
        'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    },
});
