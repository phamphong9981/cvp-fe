// CSV Parser utility - matches backend logic exactly

export interface ParsedSchedule {
    className: string
    scheduleTime: number
    subject: string
    teacherName: string
    dayName: string
    session: string
    period: string
}

// Day mapping: Thứ -> day index (1-6 for Mon-Sat)
const DAY_MAP: { [key: string]: number } = {
    'Hai': 1,
    'Ba': 2,
    'Tư': 3,
    'Năm': 4,
    'Sáu': 5,
    'Bảy': 6
}

// Function to calculate schedule time
export function calculateScheduleTime(dayName: string, session: string, period: string): number | null {
    const dayIndex = DAY_MAP[dayName]
    if (!dayIndex) return null

    const baseTime = (dayIndex - 1) * 7 // Each day has 7 slots

    if (session === 'Sáng') {
        // Morning session: period 1-5 maps to slots 1-5
        const periodNum = parseInt(period)
        if (periodNum >= 1 && periodNum <= 5) {
            return baseTime + periodNum
        }
    } else if (session === 'Chiều') {
        // Afternoon session: Ca 1-2 maps to slots 6-7
        if (period === 'Ca 1') {
            return baseTime + 6
        } else if (period === 'Ca 2') {
            return baseTime + 7
        }
    }

    return null
}

// Function to get subject from cell
export function getSubjectFromCell(cell: string): string | null {
    if (!cell || cell === '-' || !cell.includes('-')) {
        return null
    }
    // Extract subject name (before the dash)
    const parts = cell.split('-')
    let subject = parts[0].trim()

    // Remove "CĐ" or "CK" suffix from subject (e.g., "ToánCĐ" -> "Toán")
    subject = subject.replace(/CĐ$/g, '').replace(/CK$/g, '')

    return subject
}

// Function to clean teacher name
export function cleanTeacherName(rawName: string): string {
    let name = rawName.replace(/^[^-]+-/, '') // Remove subject prefix
    name = name.replace(/\([^)]+\)$/g, '') // Remove parentheses content
    name = name.replace(/[A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]+$/g, '') // Remove suffix
    return name.trim()
}

// Main parse function
export function parseSchedulesFromCSV(csvText: string): ParsedSchedule[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim())
    const result: ParsedSchedule[] = []

    // Find header line "Thứ,Buổi,Tiết"
    const headerIdx = lines.findIndex(l => l.startsWith('Thứ,Buổi,Tiết'))
    if (headerIdx === -1) {
        console.error('Không tìm thấy header "Thứ,Buổi,Tiết"')
        return result
    }

    // Parse header to get class names
    const headerCells = lines[headerIdx].split(',')
    const classNames = headerCells.slice(3).map(s => s.trim()).filter(s => /^\d{2}A\d{1,2}$/.test(s))

    console.log('Found classes:', classNames)

    // Parse data from header + 1
    let currentDayName: string | null = null
    let currentSession: string | null = null

    for (let i = headerIdx + 1; i < lines.length; i++) {
        const cells = lines[i].split(',')

        const dayCell = (cells[0] || '').trim()
        const sessionCell = (cells[1] || '').trim()
        const period = (cells[2] || '').trim()

        // Forward-fill Thứ
        if (DAY_MAP[dayCell]) currentDayName = dayCell

        // Forward-fill Buổi
        if (sessionCell) currentSession = sessionCell

        // Skip separator/missing main columns
        if (!currentDayName || !currentSession || !period) continue

        const scheduleTime = calculateScheduleTime(currentDayName, currentSession, period)
        if (!scheduleTime) continue

        // Parse schedules for each class
        for (let j = 0; j < classNames.length; j++) {
            const cell = (cells[3 + j] || '').trim()
            if (!cell || cell === '-') continue

            const subject = getSubjectFromCell(cell)
            if (!subject) continue

            const teacherFullname = cleanTeacherName(cell)
            if (!teacherFullname || teacherFullname.length < 2) continue

            result.push({
                className: classNames[j],
                scheduleTime,
                subject,
                teacherName: teacherFullname,
                dayName: currentDayName,
                session: currentSession,
                period
            })
        }
    }

    // Remove duplicates
    const dedup = new Map()
    for (const s of result) {
        dedup.set(`${s.className}|${s.scheduleTime}|${s.subject}|${s.teacherName}`, s)
    }

    const finalResult = Array.from(dedup.values())
    console.log('Parsed schedules:', finalResult.length)

    return finalResult
}

// Test function
export function testCSVParser() {
    const sampleCSV = `Sở GD&ĐT Vĩnh Phúc,,,,,,THỜI KHÓA BIỂU,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Trường THPT Chuyên Vĩnh Phúc,,,,,,Áp dụng từ ngày 06.01.2025 - Thời khóa biểu số: 14,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Thứ,Buổi,Tiết,10A1,10A2,10A3,10A4,10A5,10A6,10A7,10A8,10A9,10A10,10A11,10A12,10A13,10A14,11A1,11A2,11A3,11A4,11A5,11A6,11A7,11A8,11A9,11A10,11A11,11A12,11A13,11A14,11A15,12A1,12A2,12A3,12A4,12A5,12A6,12A7,12A8,12A9,12A10,12A11,12A12,12A13,12A14,12A15
Hai,Sáng,1,TNHN-HảoT,TNHN-NgaT,TNHN-P.DungL,TNHN-T.Hương(Ti),TNHN-Nghị,TNHN-HàH,TNHN-HiềnS,TNHN-Ng.HươngV,TNHN-ThắmV,TNHN-QuỳnhS,TNHN-P.LiênA,TNHN-HuyềnV,TNHN-TrangV,TNHN-AnhT,TNHN-LoanS,TNHN-Nhung(Ti),TNHN-ThảoT,TNHN-MinhH,TNHN-NgaH,TNHN-DungS,TNHN-HạnhCD,TNHN-HiếuA,TNHN-PhươngA,TNHN-YếnCN,TNHN-Quý,TNHN-P.Trang,TNHN-Đạo,TNHN-DungL,TNHN-Thương,TNHN-HươngS,TNHN-HảoTD,TNHN-Kiều,TNHN-HằngL,TNHN-Thu,TNHN-NhungT,TNHN-H.AnhV,TNHN-Ngân,TNHN-ThúyĐ,TNHN-Phước,TNHN-LanA,TNHN-Quang,TNHN-ThủyTD,TNHN-ThảoH,TNHN-L.AnhV
,,2,TNHN-HảoT,TNHN-NgaT,TNHN-P.DungL,TNHN-T.Hương(Ti),TNHN-Nghị,TNHN-HàH,TNHN-HiềnS,TNHN-Ng.HươngV,TNHN-ThắmV,TNHN-QuỳnhS,TNHN-P.LiênA,TNHN-HuyềnV,TNHN-TrangV,TNHN-AnhT,TNHN-LoanS,TNHN-Nhung(Ti),TNHN-ThảoT,TNHN-MinhH,TNHN-NgaH,TNHN-DungS,TNHN-HạnhCD,TNHN-HiếuA,TNHN-PhươngA,TNHN-YếnCN,TNHN-Quý,TNHN-P.Trang,TNHN-Đạo,TNHN-DungL,TNHN-Thương,TNHN-HươngS,TNHN-HảoTD,TNHN-Kiều,TNHN-HằngL,TNHN-Thu,TNHN-NhungT,TNHN-H.AnhV,TNHN-Ngân,TNHN-ThúyĐ,TNHN-Phước,TNHN-LanA,TNHN-Quang,TNHN-ThủyTD,TNHN-ThảoH,TNHN-L.AnhV
,,3,Sinh-HiềnS,Hóa-Thu,Toán-Khánh,Tin-T.Hương(Ti),Sinh-HươngS,Hóa-HàH,GDTC-ThủyTD,Văn-Ng.HươngV,C.Nghệ-Kiệm,Anh-TrangA,Anh-P.LiênA,Toán-Trường,Tin-Hồng(Ti),Toán-AnhT,Sinh-LoanS,Văn-LinhV,Lý-P.DungL,Văn-ThanhV,Tin-Nhung(Ti),Tin-Quang,KTPL-HạnhCD,GDTC-HảoTD,Toán-P.NhungT,Địa-YếnĐ,Anh-NhungA,Anh-Nhân,Anh-HiếuA,Tin-Huỳnh,Toán-Th.Hải,Lý-Đạo,Văn-P.Hương,Sinh-Phú,Lý-HằngL,GDQP-ThảoQP,Toán-NhungT,Anh-LanA,Văn-Ngân,Anh-HằngA,Địa-Phước,Lý-Nghị,Toán-HảoT,Toán-NgaT,Hóa-ThảoH,Địa-ThúyĐ
,,4,Tin-Hồng(Ti),Sinh-HươngS,Toán-Khánh,Văn-LinhV,Văn-P.Trang,Hóa-HàH,Văn-HuyềnV,Văn-Ng.HươngV,Toán-AnhT,C.Nghệ-Kiệm,Toán-ThảoT,Toán-Trường,Văn-TrangV,Anh-PhươngA,Lý-NhungL,Tin-Nhung(Ti),Anh-NhungA,Văn-ThanhV,Hóa-NgaH,Sinh-DungS,Anh-Thương,Anh-HiếuA,Văn-L.AnhV,C.Nghệ-YếnCN,Anh-Quý,Anh-Nhân,Địa-YếnĐ,Lý-DungL,KTPL-HạnhCD,Lý-Đạo,Văn-P.Hương,Anh-LanA,Lý-HằngL,Anh-NgọcA,Toán-NhungT,Văn-H.AnhV,Văn-Ngân,Địa-ThúyĐ,GDTC-HảoTD,Lý-Nghị,Địa-Phước,GDQP-ThảoQP,Văn-ThắmV,Toán-P.NhungT
,,5,Lý-HằngL,Toán-NgaT,Lý-P.DungL,Toán-Khánh,Văn-P.Trang,Toán-Trường,Văn-HuyềnV,C.Nghệ-Kiệm,Toán-AnhT,GDQP-ThảoQP,Toán-ThảoT,Tin-Hồng(Ti),Văn-TrangV,Anh-PhươngA,Lý-NhungL,Lý-Đạo,Anh-NhungA,Tin-Quang,Sinh-LoanS,Văn-LinhV,Anh-Thương,Anh-HiếuA,Văn-L.AnhV,GDTC-HảoTD,Anh-Quý,Toán-Th.Hải,Tin-Huỳnh,Lý-DungL,C.Nghệ-YếnCN,Tin-T.Hương(Ti),Anh-TrangA,Toán-NhungT,Sinh-DungS,Anh-NgọcA,Anh-HằngA,Văn-H.AnhV,Địa-Phước,Địa-ThúyĐ,Anh-Nhân,Anh-LanA,Anh-P.LiênA,GDTC-ThủyTD,Văn-ThắmV,Sinh-Phú
,Chiều,Ca 1,LýCĐ-HằngL,ToánCĐ-NgaT,ToánCĐ-Khánh,TinCĐ-HàT,AnhCĐ-NhungA,HóaCĐ-HàH,HóaCĐ-ThảoH,ToánCĐ-ThảoT,VănCĐ-ThắmV,VănCĐ-TrangV,AnhCĐ-P.LiênA,ToánCĐ-Trường,AnhCĐ-ThùyA,PhápCĐ-DươngP,LýCĐ-NhungL,LýCĐ-Đạo,LýCĐ-P.DungL,VănCĐ-ThanhV,HóaCĐ-NgaH,SinhCĐ-DungS,VănCĐ-P.Trang,ToánCĐ-ThanhT,ToánCĐ-P.NhungT,ĐịaCĐ-YếnĐ,AnhCĐ-Quý,ToánCĐ-Th.Hải,PhápCK-Yên,LýCĐ-DungL,VănCĐ-LinhV,HóaCĐ-MinhH,LýCĐ-TuấnL,VănCĐ-Ng.HươngV,AnhCĐ-TrangA,AnhCĐ-NgọcA,ToánCĐ-NhungT,AnhCĐ-LanA,SửCĐ-QuỳnhS,AnhCĐ-HằngA,AnhCĐ-Nhân,VănCĐ-P.Hương,ToánCĐ-HảoT,AnhCĐ-Thương,ToánCĐ-ThúyT,VănCĐ-L.AnhV
,,Ca 2,AnhCĐ-PhươngA,ToánCĐ-NgaT,LýCĐ-P.DungL,TinCĐ-HàT,LýCĐ-TuấnL,ToánCĐ-Trường,SinhCĐ-HiềnS,VănCĐ-Ng.HươngV,VănCĐ-ThắmV,SửCĐ-QuỳnhS,VănCĐ-TrangV,,AnhCĐ-ThùyA,ToánCĐ-AnhT,ToánCĐ-P.NhungT,HóaCĐ-NgaH,AnhCĐ-NhungA,HóaCĐ-MinhH,LýCĐ-Nghị,VănCĐ-LinhV,,,,ĐịaCĐ-YếnĐ,AnhCĐ-Quý,,PhápCĐ-Yên,VănCĐ-ThanhV,,LýCĐ-Đạo,AnhCĐ-TrangA,,LýCĐ-HằngL,,ToánCĐ-NhungT,ToánCĐ-ThanhT,,,,,,VănCĐ-P.Hương,,`

    const result = parseSchedulesFromCSV(sampleCSV)
    console.log('Test result:', result.slice(0, 5)) // Show first 5 results
    return result
}
