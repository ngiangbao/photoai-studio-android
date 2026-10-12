<div align="center">

# 📸 PhotoAI Studio — Web Edition

**Chụp ảnh qua camera hoặc tải ảnh lên, chỉnh sửa và tạo nội dung bằng AI (Gemini, Nano Banana, Veo)**

![Version](https://img.shields.io/badge/version-alpha--0.0.1-orange)
![Platform](https://img.shields.io/badge/platform-Web-0ea5e9?logo=googlechrome&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini%20%7C%20Nano%20Banana%20%7C%20Veo-8E44AD?logo=google)
![Status](https://img.shields.io/badge/status-alpha-red)

</div>

---

> ⚠️ **Lưu ý: đây là dự án "vibe coding".** Phần lớn ứng dụng được xây dựng rất nhanh với
> sự hỗ trợ của AI (bao gồm cả README này), mang tính thử nghiệm để khám phá ý tưởng.
> Vì vậy ứng dụng **có thể còn lỗi, giao diện/tính năng có thể thay đổi nhanh giữa các
> phiên bản**, và chưa qua kiểm thử kỹ như một sản phẩm thương mại. Lưu ý này cũng được
> hiển thị ngay trong mục **Cài đặt** của app. Góp ý & báo lỗi luôn được hoan nghênh qua
> [Issues](../../issues).

## 📖 Giới thiệu

**PhotoAI Studio (Web Edition)** là bản viết lại hoàn toàn trên nền Web/React của
[bản ứng dụng Windows gốc](https://github.com/ngiangbao/photoai-studio), chạy ngay trên
trình duyệt (máy tính hoặc điện thoại) mà không cần cài đặt phần mềm. Người dùng chụp ảnh
bằng camera (webcam/camera điện thoại) hoặc tải ảnh có sẵn lên, sau đó dùng AI của Google
(Gemini, Nano Banana, Veo) để chỉnh sửa, tạo ảnh mới hoặc tạo video động.

## ✨ Tính năng chính

- **Chụp & nhập ảnh**: camera trực tiếp (đổi camera trước/sau), hoặc tải ảnh từ máy.
- **7 phong cách chỉnh ảnh AI**: Chân dung, Ngoại cảnh, Phong cảnh, Chụp người/đời thường,
  Kỷ yếu, Anime/Manga, Cyberpunk Neon — cùng các bộ công cụ **Chỉnh da** (mịn da, trắng da,
  sáng mắt, thon mặt, xóa khuyết điểm), **Công cụ AI** (làm nét HD, đổi nền, ánh sáng
  studio, xóa vật thể) và **Bộ lọc màu** nhanh (không cần AI, xử lý ngay trên máy).
- **So sánh Before / After** với thanh trượt trực quan, hỗ trợ ghi chú thêm cho AI.
- **Xử lý hàng loạt (Batch Studio)**: chọn nhiều ảnh, áp dụng cùng lúc 1 phong cách AI, 1 bộ
  lọc màu, hoặc tạo video Veo cho tất cả ảnh đã chọn — kèm thanh tiến trình theo từng ảnh.
- **Phân loại Album bằng AI**: tự động quét thư viện và sắp ảnh vào Chân dung / Phong cảnh /
  Selfie / Sự kiện.
- **Studio sáng tạo (Nano Banana 2.1 & Veo 3.1)**:
  - Tạo ảnh mới từ mô tả văn bản bằng `gemini-nano-banana-2.1` (nhiều tỷ lệ khung hình).
  - Tạo video AI bằng **Veo 3.1** — từ văn bản hoặc "thổi hồn" cho một ảnh tĩnh (video thật
    được theo dõi tiến trình và tải về để xem/lưu, không chỉ dừng ở bước khởi tạo).
- **Song ngữ hoàn chỉnh**: Tiếng Việt 🇻🇳 và English 🇬🇧, đổi ngay trong app.
- **Giao diện Sáng / Tối / Theo hệ thống**, kiểm tra cập nhật phiên bản ngay trong app.

## 🛠️ Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Lucide Icons |
| Backend | Express (phục vụ API + Vite SPA) |
| AI | Google GenAI SDK (`@google/genai`) — Gemini, Nano Banana, Veo |
| Lưu trữ | LocalStorage (ảnh & cài đặt) + HTML5 Canvas (xử lý bộ lọc/ chỉnh tay) |

## 🚀 Chạy thử dự án

Hiện ứng dụng chưa có bản triển khai (deploy) công khai sẵn — cần chạy bằng Node.js:

```bash
git clone https://github.com/ngiangbao/photoai-studio-android.git
cd photoai-studio-android
npm install

# (tuỳ chọn) đặt sẵn API key hệ thống để không phải nhập trong app mỗi lần:
# export GEMINI_API_KEY=AIzaSy...

npm run dev        # chạy dev server tại http://localhost:3000
# hoặc
npm run build && npm start   # build production rồi chạy
```

Mở `http://localhost:3000`, vào **Cài đặt** để nhập Gemini API key của bạn (lấy miễn phí tại
[Google AI Studio](https://ai.google.dev)) nếu chưa đặt `GEMINI_API_KEY` ở trên.

> 🗺️ Việc triển khai một bản online cố định (để mở link là dùng được ngay, không cần cài
> Node.js) đang nằm trong Roadmap, đúng với tinh thần "đơn giản nhất cho người không rành kỹ
> thuật" của dự án.

## 📝 Lịch sử phiên bản

> README này được cập nhật ở mỗi lần phát hành phiên bản mới. Từ bản `alpha-0.0.1`, số phiên
> bản (`version.json`) được tự động tăng lên ở mỗi lần đẩy code lên nhánh `main` (xem
> `.github/workflows/version-bump.yml`), nên không cần tự tay sửa số phiên bản nữa.

- **alpha-0.0.1** (2026-10-12) — Bản ghi nhận lại sau khi dự án được viết lại hoàn toàn sang
  Web/React (từ bản Android gốc) và bổ sung nhiều tính năng mới qua "vibe coding":
  - **Sửa lỗi:** tính năng tạo **Video Veo 3.1** (cả ở Studio sáng tạo và Xử lý hàng loạt)
    trước đó chỉ gửi yêu cầu rồi dừng lại ở màn hình "đang xử lý" — phần giao diện đã có
    nhưng chưa có phần hậu kỳ (backend) theo dõi tiến trình. Đã bổ sung: tự động kiểm tra
    tiến trình tạo video, tải video thật về, hiển thị video để xem và tải xuống.
  - Thêm lưu ý "dự án vibe coding" ngay trong mục Cài đặt và trong README này.
  - Gộp số phiên bản ứng dụng (trước đó bị lệch giữa `package.json`, server và client) về
    một nguồn duy nhất (`version.json`), và tự động tăng số phiên bản ở mỗi lần phát hành.
  - Dọn các file Gradle/Android còn sót lại từ repo cũ (không còn cần thiết cho bản Web).

## 🗺️ Roadmap

- [ ] Triển khai bản online công khai (một link mở ra dùng ngay, không cần cài Node.js).
- [ ] Lưu video Veo đã tạo vào thư viện ảnh (hiện chỉ hỗ trợ tải xuống máy).
- [ ] Xử lý song song nhiều video Veo trong Batch Studio (hiện xử lý tuần tự từng ảnh).
- [ ] Đồng bộ ảnh/cài đặt lên tài khoản thay vì chỉ lưu LocalStorage trên một máy.

## 🤝 Đóng góp

Mở [Issue](../../issues) hoặc gửi Pull Request. Bản gốc cho Windows (desktop, tethering máy
ảnh qua USB) nằm ở [ngiangbao/photoai-studio](https://github.com/ngiangbao/photoai-studio).

## 📄 License

Phát hành theo giấy phép [MIT](LICENSE).
