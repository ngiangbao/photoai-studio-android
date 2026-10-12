<div align="center">

# 📸 PhotoAI Studio — Android

**Chụp ảnh bằng camera điện thoại, chỉnh sửa bằng AI (Gemini) — phiên bản Android**

![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android)
![Version](https://img.shields.io/badge/version-alpha--001-orange)
![Kotlin](https://img.shields.io/badge/kotlin-2.0-7F52FF?logo=kotlin&logoColor=white)
![UI](https://img.shields.io/badge/UI-Jetpack%20Compose-4285F4?logo=jetpackcompose&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini-8E44AD?logo=google)
![Status](https://img.shields.io/badge/status-alpha-red)

[**⬇️ Tải file APK mới nhất**](../../releases/latest) · [Báo lỗi](../../issues)

**🇻🇳 Tiếng Việt / 🇬🇧 English** — app tự hiển thị theo ngôn ngữ máy của bạn

</div>

---

## 📲 Cài đặt (cho mọi người, không cần biết kỹ thuật)

1. Mở link **[Tải file APK mới nhất](../../releases/latest)** trên điện thoại, bấm vào file
   `PhotoAIStudio-android-alpha-001.apk` để tải xuống.
2. Mở file `.apk` vừa tải. Nếu máy hỏi "Cài đặt app từ nguồn không rõ?" (vì app chưa đăng lên
   Google Play), chọn **Cho phép** / **Install anyway** — đây là bước bình thường với mọi app
   cài ngoài Play Store.
3. Bấm **Cài đặt**. Xong — mở app, cấp quyền Camera khi được hỏi, vào **Cài đặt** trong app để
   nhập Gemini API key ([lấy miễn phí tại Google AI Studio](https://ai.google.dev)), rồi dùng
   bình thường: chụp ảnh → chọn phong cách → Chỉnh sửa bằng AI → Lưu ảnh.

Không cần cài Android Studio, không cần máy tính — chỉ cần điện thoại Android 8.0 trở lên.

## Khác biệt so với bản Windows

PhotoAI Studio bản gốc cho Windows ([repo riêng](https://github.com/ngiangbao/photoai-studio))
dùng **digiCamControl** để chụp tethering qua USB từ máy ảnh Canon/Nikon/Sony rời — công cụ
**chỉ chạy trên Windows**, không có bản tương đương trên Android. Bản Android dùng **camera có
sẵn của điện thoại** (qua CameraX) thay thế, giữ nguyên luồng làm việc còn lại: 5 phong cách
chỉnh sửa, prompt gửi cho Gemini, giao diện before/after — giống hệt bản desktop.

## 🗺️ Roadmap

- [ ] Nhập ảnh có sẵn từ thư viện máy (Photo Picker) bên cạnh chụp trực tiếp
- [ ] Kết nối máy ảnh rời qua USB-OTG (PTP/MTP) cho máy hỗ trợ
- [ ] Chụp hàng loạt / xử lý hàng loạt bằng AI
- [ ] Bản ký số ổn định thay cho bản debug hiện tại, đăng lên Google Play

## 📝 Lịch sử phiên bản

> README này được cập nhật ở mỗi lần phát hành phiên bản mới.

- **alpha-001** (phiên bản đầu tiên) — chụp ảnh bằng camera điện thoại, 5 phong cách chỉnh sửa
  AI qua Gemini, hỗ trợ song ngữ Việt/Anh tự động theo ngôn ngữ máy. APK ký bằng khóa debug
  tiêu chuẩn của Android để đơn giản hoá bản phát hành thử nghiệm.

---

## 🧑‍💻 Dành cho người muốn build từ mã nguồn

<details>
<summary>Bấm để xem (không cần cho người dùng thông thường)</summary>

### Build bằng Android Studio

- Android Studio (Koala trở lên), JDK 17.
- Mở thẳng thư mục gốc repo này bằng Android Studio — nó sẽ tự tạo Gradle wrapper (`gradlew`)
  nếu chưa có, và tự đồng bộ phiên bản Android Gradle Plugin/Compose Compiler cần thiết.
- Chạy app (▶) trên thiết bị thật hoặc máy ảo có camera.

### Build & phát hành tự động (GitHub Actions)

`.github/workflows/android-release.yml` tự build file `.apk` (debug) và đăng lên mục
**Releases** mỗi khi:
- có tag dạng `v*` được đẩy lên, hoặc
- được chạy thủ công qua tab **Actions → Build & Release Android APK → Run workflow**.

### Kiến trúc mã nguồn

```
app/src/main/java/com/ngiangbao/photoaistudio/
├── MainActivity.kt          # Điểm khởi chạy
├── PhotoAiStudioApp.kt      # Application class
├── ai/
│   ├── EditStyle.kt         # 5 phong cách + prompt gửi Gemini
│   └── GeminiEditor.kt      # Gọi Gemini REST API
├── camera/
│   └── CameraController.kt  # CameraX - chụp ảnh bằng camera điện thoại
├── data/
│   ├── AppConfig.kt         # Hằng số cấu hình
│   ├── SettingsRepository.kt# Lưu API key/model qua DataStore
│   └── PhotoRepository.kt   # Danh sách ảnh đã chụp / đường dẫn ảnh đã chỉnh
├── util/
│   └── AppError.kt          # Lỗi/trạng thái dạng có cấu trúc để hiển thị song ngữ
└── ui/
    ├── AppViewModel.kt      # Điều phối camera/AI/settings
    ├── HomeScreen.kt        # Xem trước camera + nút chụp + lưới thumbnail
    ├── EditorScreen.kt      # Before/after + chọn phong cách + ghi chú + Lưu ảnh
    ├── SettingsScreen.kt    # Nhập Gemini API key / model
    ├── ErrorMessages.kt     # Chuyển AppError/AppStatus sang chuỗi hiển thị
    ├── StyleLabels.kt       # Ánh xạ style key -> chuỗi hiển thị
    ├── PhotoAiStudioNavHost.kt
    └── theme/                # Material 3 theme
```

Chuỗi hiển thị song ngữ nằm ở `app/src/main/res/values/strings.xml` (tiếng Anh, mặc định) và
`app/src/main/res/values-vi/strings.xml` (tiếng Việt, tự áp dụng khi máy đặt ngôn ngữ Việt).
Prompt gửi cho Gemini (trong `ai/EditStyle.kt`) giữ nguyên tiếng Việt vì đó là chỉ dẫn gửi cho
AI, không phải nội dung hiển thị, nên không cần dịch theo ngôn ngữ máy.

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | Kotlin 2.0 |
| Giao diện | Jetpack Compose + Material 3 |
| Camera | CameraX (`camera-core`, `camera-camera2`, `camera-view`) |
| Chỉnh sửa ảnh AI | Gọi thẳng REST API của Gemini (`generateContent`) qua OkHttp |
| Lưu cấu hình | Jetpack DataStore (Preferences) |
| Tải ảnh thumbnail | Coil |

Ảnh chụp lưu tại thư mục riêng của app
(`Android/data/com.ngiangbao.photoaistudio/files/RawCaptures`), ảnh đã chỉnh sửa lưu tại
`.../files/Edited`.

</details>

## 🤝 Đóng góp

Mở [Issue](../../issues) hoặc gửi Pull Request. Bản Windows nằm ở
[ngiangbao/photoai-studio](https://github.com/ngiangbao/photoai-studio).
