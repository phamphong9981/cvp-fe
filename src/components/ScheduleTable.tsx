'use client'

import React, { useMemo, useState } from 'react'

type NormalizedScheduleItem = {
    id: string
    classId: string
    scheduleTime: number
    subject: string
    teacherId: string
    weekId: string
    class: { id: string; name: string }
    teacher: { id: string; fullname: string }
    dayIndex: number // 0..5 (Hai..Bảy)
    period: number // 1..7
    session: 'Sáng' | 'Chiều'
}

interface ScheduleTableProps {
    scheduleData: NormalizedScheduleItem[]
    classes: Array<{ id: string; name: string }>
    selectedWeek: string
}

export function ScheduleTable({ scheduleData, classes }: ScheduleTableProps) {
    const days = ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy']
    const morningPeriods = [1, 2, 3, 4, 5]
    const afternoonPeriods = [6, 7]

    const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

    const index = useMemo(() => {
        const m = new Map<string, NormalizedScheduleItem[]>()
        for (const it of scheduleData) {
            const key = `${it.classId}|${it.dayIndex}|${it.period}`
            const arr = m.get(key)
            if (arr) arr.push(it)
            else m.set(key, [it])
        }
        return m
    }, [scheduleData])

    const getCell = (clsId: string, dayIdx: number, period: number) =>
        index.get(`${clsId}|${dayIdx}|${period}`) ?? []

    const handleHeaderClick = (classId: string) => {
        setSelectedClassId(prevId => (prevId === classId ? null : classId))
    }

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-200 text-gray-900 sticky top-0 z-20">
                    <tr>
                        <th className="px-3 py-4 text-center font-bold border-b-2 border-r border-gray-300 min-w-[72px] sticky left-0 z-30 bg-gray-200 uppercase tracking-wider text-sm">
                            Thứ
                        </th>
                        <th className="px-3 py-4 text-center font-bold border-b-2 border-r border-gray-300 min-w-[72px] sticky left-[72px] z-30 bg-gray-200 uppercase tracking-wider text-sm">
                            Buổi
                        </th>
                        <th className="px-3 py-4 text-center font-bold border-b-2 border-r border-gray-300 min-w-[56px] uppercase tracking-wider text-sm">
                            Tiết
                        </th>
                        {classes.map((c) => (
                            <th
                                key={c.id}
                                className={`px-3 py-4 text-center font-bold border-b-2 border-r border-gray-300 min-w-[96px] uppercase tracking-wider text-sm last:border-r-0 
                                    cursor-pointer transition-colors
                                    ${c.id === selectedClassId
                                        ? 'bg-blue-200 text-blue-900'
                                        : 'hover:bg-gray-300'
                                    }
                                `}
                                title={c.name}
                                onClick={() => handleHeaderClick(c.id)}
                            >
                                {c.name}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {days.map((dayLabel, dayIdx) => (
                        <React.Fragment key={dayLabel}>
                            {/* Khối Sáng */}
                            {morningPeriods.map((p, i) => (
                                <tr
                                    key={`d${dayIdx}-p${p}`}
                                    className={dayIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                >
                                    {/* THỨ - gộp 7 hàng */}
                                    {i === 0 && (
                                        <td
                                            /* THAY ĐỔI:
                                              - Bỏ: ${dayIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                              - Thêm: bg-gray-100 (nền cố định)
                                              - Đổi: font-medium -> font-semibold (đậm hơn)
                                            */
                                            className="px-2.5 py-2 text-center font-semibold text-gray-800 border-b border-r border-gray-300 sticky left-0 z-10 bg-gray-100"
                                            rowSpan={7}
                                        >
                                            {dayLabel}
                                        </td>
                                    )}
                                    {/* BUỔI - gộp 5 hàng */}
                                    {i === 0 && (
                                        <td
                                            /* THAY ĐỔI: (Tương tự)
                                              - Bỏ: ${dayIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                              - Thêm: bg-gray-100
                                              - Đổi: font-medium -> font-semibold
                                            */
                                            className="px-2.5 py-2 text-center font-semibold text-gray-800 border-b border-r border-gray-300 sticky left-[72px] z-10 bg-gray-100"
                                            rowSpan={5}
                                        >
                                            Sáng
                                        </td>
                                    )}
                                    {/* TIẾT */}
                                    <td className="px-2.5 py-2 text-center font-semibold text-gray-800 border-b border-r border-gray-300">
                                        {p}
                                    </td>

                                    {/* Cột lớp */}
                                    {classes.map((cls) => {
                                        const items = getCell(cls.id, dayIdx, p)
                                        return (
                                            <td
                                                key={`${cls.id}-${dayIdx}-${p}`}
                                                className={`px-2 py-2 border-b border-r border-gray-300 align-top last:border-r-0 transition-colors ${cls.id === selectedClassId ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                {items.length ? (
                                                    <div className="space-y-1">
                                                        {items.map((it) => (
                                                            <div
                                                                key={it.id}
                                                                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center hover:shadow-md hover:border-slate-300 transition-shadow cursor-pointer"
                                                                title={`${it.subject} - ${it.teacher.fullname}`}
                                                            >
                                                                <div className="font-bold text-blue-700 truncate">
                                                                    {it.subject}
                                                                </div>
                                                                <div className="text-[11px] text-gray-700 truncate">
                                                                    {it.teacher.fullname}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-10 flex items-center justify-center text-gray-400">
                                                        –
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}

                            {/* Khối Chiều */}
                            {afternoonPeriods.map((p, i) => (
                                <tr
                                    key={`d${dayIdx}-p${p}`}
                                    className={dayIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                >
                                    {/* (Cột THỨ đã rowspan) */}

                                    {/* BUỔI - gộp 2 hàng */}
                                    {i === 0 && (
                                        <td
                                            /* THAY ĐỔI: (Tương tự)
                                              - Bỏ: ${dayIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                              - Thêm: bg-gray-100
                                              - Đổi: font-medium -> font-semibold
                                            */
                                            className="px-2.5 py-2 text-center font-semibold text-gray-800 border-b border-r border-gray-300 sticky left-[72px] z-10 bg-gray-100"
                                            rowSpan={2}
                                        >
                                            Chiều
                                        </td>
                                    )}

                                    {/* TIẾT → Ca 1/2 */}
                                    <td className="px-2.5 py-2 text-center font-semibold text-gray-800 border-b border-r border-gray-300">
                                        {p === 6 ? 'Ca 1' : 'Ca 2'}
                                    </td>

                                    {/* Cột lớp (Tương tự buổi sáng) */}
                                    {classes.map((cls) => {
                                        const items = getCell(cls.id, dayIdx, p)
                                        return (
                                            <td
                                                key={`${cls.id}-${dayIdx}-${p}`}
                                                className={`px-2 py-2 border-b border-r border-gray-300 align-top last:border-r-0 transition-colors ${cls.id === selectedClassId ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                {items.length ? (
                                                    <div className="space-y-1">
                                                        {items.map((it) => (
                                                            <div
                                                                key={it.id}
                                                                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center hover:shadow-md hover:border-slate-300 transition-shadow cursor-pointer"
                                                                title={`${it.subject} - ${it.teacher.fullname}`}
                                                            >
                                                                <div className="font-bold text-blue-700 truncate">
                                                                    {it.subject}
                                                                </div>
                                                                <div className="text-[11px] text-gray-700 truncate">
                                                                    {it.teacher.fullname}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-10 flex items-center justify-center text-gray-400">
                                                        –
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    )
}