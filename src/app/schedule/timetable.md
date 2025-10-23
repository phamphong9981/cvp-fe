# API getTimetable

## Mô tả
API này lấy thời khóa biểu của tất cả các lớp trong một tuần cụ thể, được group theo từng lớp.

## Endpoint
```
GET /schedules/timetable?weekId={weekId}
```

## Authentication
- **Required**: JWT Token trong header `Authorization: Bearer {token}`
- **Guard**: JwtAuthGuard

## Parameters
### Query Parameters
- `weekId` (string, required): ID của tuần cần lấy thời khóa biểu

## Response
Trả về thời khóa biểu được group theo từng lớp:

```typescript
{
  "week": {
    "id": "uuid",
    "startDate": "2025-01-06T00:00:00.000Z",
    "endDate": "2025-01-12T00:00:00.000Z",
    "status": "active"
  },
  "timetable": [
    {
      "classId": "uuid",
      "className": "10A1",
      "schedules": [
        {
          "id": "uuid",
          "scheduleTime": 1,
          "subject": "Toán",
          "teacher": {
            "id": "uuid",
            "fullname": "Nguyễn Văn A"
          }
        },
        {
          "id": "uuid",
          "scheduleTime": 2,
          "subject": "Văn",
          "teacher": {
            "id": "uuid",
            "fullname": "Trần Thị B"
          }
        }
      ]
    },
    {
      "classId": "uuid",
      "className": "10A2",
      "schedules": [
        // ... schedules for 10A2
      ]
    }
  ],
  "totalClasses": 44,
  "totalSchedules": 1200
}
```

## Cách hoạt động
1. API lấy tất cả schedule của tuần được chỉ định
2. Group schedule theo từng lớp (className)
3. Sắp xếp theo tên lớp và thời gian (scheduleTime)
4. Trả về kết quả với thông tin tuần và thống kê

## Schedule Time Mapping
- Mỗi ngày có 7 slot (5 buổi sáng + 2 buổi chiều)
- Thứ 2-7: slot 1-42 (6 ngày × 7 slot)
- Buổi sáng: slot 1-5 của mỗi ngày
- Buổi chiều: slot 6-7 của mỗi ngày

## Error Handling
- **400 Bad Request**: Khi thiếu `weekId` parameter
- **401 Unauthorized**: Khi JWT token không hợp lệ hoặc thiếu
- **404 Not Found**: Khi không tìm thấy week hoặc không có schedule

## Ví dụ sử dụng

### Request
```bash
curl -X GET "http://localhost:3000/schedules/timetable?weekId=week-uuid-here" \
  -H "Authorization: Bearer your-jwt-token"
```

### Response Example
```json
{
  "week": {
    "id": "week-uuid-1",
    "startDate": "2025-01-06T00:00:00.000Z",
    "endDate": "2025-01-12T00:00:00.000Z",
    "status": "active"
  },
  "timetable": [
    {
      "classId": "class-uuid-1",
      "className": "10A1",
      "schedules": [
        {
          "id": "schedule-uuid-1",
          "scheduleTime": 1,
          "subject": "Toán",
          "teacher": {
            "id": "teacher-uuid-1",
            "fullname": "Nguyễn Văn A"
          }
        }
      ]
    }
  ],
  "totalClasses": 1,
  "totalSchedules": 1
}
```

## Lưu ý
- API trả về tất cả các lớp có schedule trong tuần
- Schedules được sắp xếp theo thứ tự thời gian trong ngày
- Nếu không có schedule nào, `timetable` sẽ là mảng rỗng
- `week` sẽ là `null` nếu không có schedule nào trong tuần