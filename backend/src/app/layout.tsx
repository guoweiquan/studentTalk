import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: '谈话记录 API',
    description: '老师-学生谈话记录小程序后端服务',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <body>{children}</body>
        </html>
    );
}
