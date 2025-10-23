'use client'

interface ScheduleHeaderProps {
    weekInfo?: {
        startDate: string
        endDate: string
        status: string
    }
}

export function ScheduleHeader({ weekInfo }: ScheduleHeaderProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Sở GD&ĐT Vĩnh Phúc</h1>
                    <h2 className="text-xl font-semibold mb-4">Trường THPT Chuyên Vĩnh Phúc</h2>
                    <div className="bg-white/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">THỜI KHÓA BIỂU</h3>
                        {weekInfo && (
                            <p className="text-sm">
                                Áp dụng từ ngày {new Date(weekInfo.startDate).toLocaleDateString('vi-VN')} -
                                Thời khóa biểu số: 14
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
