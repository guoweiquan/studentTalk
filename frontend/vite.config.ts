import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
    plugins: [uni()],
    server: {
        port: 5173,
        host: true, // 允许外部访问
        allowedHosts: [
            '18bc9de.r28.cpolar.top', // cpolar 内网穿透域名
            '.cpolar.top', // 允许所有 cpolar 子域名
        ],
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
