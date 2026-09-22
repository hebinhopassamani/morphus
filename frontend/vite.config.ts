import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import flowbiteReact from 'flowbite-react/plugin/vite';
import path from 'path';

export default defineConfig({
    plugins: [react(), tailwindcss(), flowbiteReact()],
    resolve: {
        tsconfigPaths: true,
        alias: {
            '@components': path.resolve(import.meta.dirname, './src/core/components'),
            '@morphus': path.resolve(import.meta.dirname, './src/apps/morphus'),
            '@security': path.resolve(import.meta.dirname, './src/apps/security'),
            '@website': path.resolve(import.meta.dirname, './src/apps/website'),
            '@styles': path.resolve(import.meta.dirname, './src/styles'),
            '@core': path.resolve(import.meta.dirname, './src/core'),
            '@src': path.resolve(import.meta.dirname, './src'),
        },
    },
});
