export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold">老师-学生谈话记录 API 服务</h1>
            <p className="mt-4 text-gray-600">服务运行正常</p>
            <div className="mt-8 text-left">
                <h2 className="text-xl font-semibold mb-2">API 接口:</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>GET /api/v1/record - 获取记录列表</li>
                    <li>POST /api/v1/record - 创建新记录</li>
                    <li>GET /api/v1/record/:id - 获取记录详情</li>
                    <li>DELETE /api/v1/record/:id - 删除记录</li>
                    <li>GET /api/v1/quick-tag - 获取所有快捷标签</li>
                    <li>POST /api/v1/quick-tag/:id/detail - 添加标签明细</li>
                    <li>DELETE /api/v1/quick-tag/detail/:detailId - 删除标签明细</li>
                </ul>
            </div>
        </main>
    );
}
