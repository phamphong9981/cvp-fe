# Cập nhật Hệ thống Quản lý - THPT Chuyên Vĩnh Phúc

## Tổng quan
Đã cập nhật toàn bộ giao diện và chức năng đăng nhập cho hệ thống quản lý admin của trường THPT Chuyên Vĩnh Phúc.

## Các thay đổi chính

### 1. Cập nhật API Login
- **File**: `src/hooks/userUser.ts`
- **Thay đổi**: 
  - Cập nhật `LoginResponse` interface để phù hợp với API backend mới
  - Loại bỏ các trường cũ: `isPremium`, `classname`, `yearOfBirth`
  - Thêm các trường mới: `token`, `username`, `userId`, `type`
  - Cập nhật endpoint trả về đúng định dạng: `response.data` thay vì `response.data?.data`

```typescript
export interface LoginResponse {
    token: string
    username: string
    userId: string
    type: string
}
```

### 2. Trang Đăng Nhập Mới
- **File**: `src/app/login/page.tsx`
- **Tính năng**:
  - Giao diện hiện đại với gradient background
  - Logo và branding của trường Chuyên Vĩnh Phúc
  - Form đăng nhập với validation
  - Hiển thị lỗi thân thiện
  - Loading state khi đang xử lý
  - Tự động redirect sau khi đăng nhập thành công
  - Responsive design cho mọi thiết bị

### 3. Trang Dashboard Admin
- **File**: `src/app/dashboard/page.tsx`
- **Tính năng**:
  - Header với thông tin người dùng và nút đăng xuất
  - Welcome section với đồng hồ thời gian thực
  - 4 thẻ thống kê (học sinh, lớp, giáo viên, môn học)
  - Thao tác nhanh (Quick Actions) cho các chức năng chính
  - Thông tin tài khoản chi tiết
  - Protected route - chỉ truy cập được khi đã đăng nhập
  - Responsive layout

### 4. Trang Home
- **File**: `src/app/page.tsx`
- **Tính năng**:
  - Tự động redirect đến dashboard nếu đã đăng nhập
  - Redirect đến login nếu chưa đăng nhập
  - Loading state

### 5. Cập nhật Layout
- **File**: `src/app/layout.tsx`
- **Thay đổi**: Cập nhật metadata với tên và mô tả của trường THPT Chuyên Vĩnh Phúc

### 6. Middleware
- **File**: `src/middleware.ts`
- **Mục đích**: Chuẩn bị cho việc bảo vệ routes (hiện tại sử dụng client-side protection)

## Cấu trúc Thư mục

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Trang đăng nhập
│   ├── dashboard/
│   │   └── page.tsx          # Trang dashboard admin
│   ├── page.tsx              # Trang chủ (redirect logic)
│   ├── layout.tsx            # Layout chung
│   ├── providers.tsx         # React Query Provider
│   └── globals.css           # Global styles
├── hooks/
│   ├── useAuth.ts            # Hook xác thực (không thay đổi)
│   ├── userUser.ts           # Hook đăng nhập (đã cập nhật)
│   └── apiClient.ts          # Axios instance
└── middleware.ts             # Next.js middleware

```

## API Endpoint

### POST /login
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "username": "string",
  "userId": "string",
  "type": "string"
}
```

## Chạy ứng dụng

### Development
```bash
npm run dev
# hoặc
yarn dev
```

### Build
```bash
npm run build
npm start
# hoặc
yarn build
yarn start
```

## Công nghệ sử dụng

- **Framework**: Next.js 15.4.1 (App Router)
- **UI**: React 19.1.0, Tailwind CSS 4
- **State Management**: TanStack React Query 5.83.0
- **HTTP Client**: Axios 1.10.0
- **TypeScript**: 5.x

## Màu sắc & Thiết kế

- **Primary Colors**: Blue (#2563EB) và Purple (#9333EA)
- **Background**: Gradient từ blue-50 qua white đến purple-50
- **Design Style**: Modern, clean, professional
- **Icons**: Heroicons (SVG)

## Các vai trò người dùng

Hệ thống hỗ trợ các loại người dùng sau (dựa trên field `type`):
- `admin`: Quản trị viên
- `teacher`: Giáo viên  
- `staff`: Nhân viên

## Bảo mật

- Token được lưu trong localStorage
- Token được tự động thêm vào header của mọi API request
- Protected routes với client-side authentication check
- Tự động redirect nếu chưa đăng nhập

## Các tính năng tiếp theo có thể phát triển

1. ✅ Đăng nhập
2. 🔲 Quản lý học sinh (CRUD)
3. 🔲 Quản lý lớp học
4. 🔲 Quản lý giáo viên
5. 🔲 Thời khóa biểu
6. 🔲 Điểm danh
7. 🔲 Quản lý điểm số
8. 🔲 Báo cáo và thống kê
9. 🔲 Thông báo
10. 🔲 Cài đặt hệ thống

## Liên hệ & Hỗ trợ

Mọi thắc mắc và góp ý xin liên hệ với đội ngũ phát triển.

---
*Cập nhật lần cuối: Tháng 10, 2025*

