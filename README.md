# 📸 PhotoAI Studio — React Web Edition

Chụp ảnh qua camera hoặc tải ảnh từ thiết bị, chỉnh sửa nghệ thuật bằng Gemini AI với 5 phong cách độc đáo. Phiên bản viết lại cho nền tảng Web/React từ phiên bản Android gốc.

## ✨ Tính năng chính

- **Camera & Tải ảnh**:
  - Live viewfinder chụp ảnh trực tiếp qua webcam/camera thiết bị.
  - Hỗ trợ đổi camera trước / sau (`user` / `environment`).
  - Hỗ trợ tải ảnh từ thư viện máy tính / điện thoại (upload & drag-and-drop).
  - Quản lý danh sách ảnh đã chụp và tải lên với bộ sưu tập thumbnail trực quan.

- **5 Phong cách chỉnh sửa AI (Gemini)**:
  1. **Chân dung (Portrait)**: Làm mịn da tự nhiên, xóa mờ hậu cảnh bokeh ấm áp, làm nổi bật ánh mắt.
  2. **Ngoại cảnh (Outdoor)**: Cân bằng sáng tự nhiên, tăng rực rỡ bầu trời và cây cỏ mang phong cách điện ảnh nhẹ nhàng.
  3. **Phong cảnh (Landscape)**: Tăng dynamic range, mây trời sắc nét, chiều sâu màu sắc sống động.
  4. **Chụp người / Đời thường (People)**: Cân bằng da đồng đều tự nhiên cho nhóm nhiều người, giữ màu sắc trung thực.
  5. **Chụp kỷ yếu (Graduation)**: Tông màu tươi sáng rực rỡ, làm nổi bật nụ cười và lễ phục cử nhân.

- **So sánh ảnh Before / After**:
  - Chế độ so sánh Before / After với thanh trượt tương tác chia đôi màn hình.
  - Hỗ trợ thêm chỉ dẫn bằng chữ cho AI (Extra notes).

- **Lưu & Tải ảnh**:
  - Tải ảnh chất lượng cao về máy (JPEG) và lưu vào bộ sưu tập nội bộ.

- **Cài đặt & Hỗ trợ song ngữ**:
  - Hỗ trợ song ngữ hoàn chỉnh: Tiếng Việt 🇻🇳 và English 🇬🇧.
  - Tùy chọn cấu hình Gemini API Key và tùy biến Model (`gemini-2.5-flash-image`, `gemini-3.1-flash-lite-image`).
  - Tự động nhận diện API key từ biến môi trường hệ thống.

## 🛠️ Công nghệ

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Express + Vite SPA proxy.
- **AI**: Google GenAI SDK (`@google/genai`).
- **Lưu trữ**: LocalStorage & HTML5 Canvas Image Processing.

## 🚀 Khởi chạy dự án

```bash
# Cài đặt thư viện
npm install

# Chạy server dev (Port 3000)
npm run dev

# Build production
npm run build
```
