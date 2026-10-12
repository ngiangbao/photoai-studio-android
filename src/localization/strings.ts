export const strings = {
  vi: {
    app_name: 'PhotoAI Studio',
    app_subtitle: 'Biên tập & Chỉnh ảnh phong cách Xingtu / Hypic',
    capture_new_photo: 'Chụp ảnh HD',
    capturing: 'Đang chụp…',
    camera_permission_rationale: 'Cần quyền Camera để chụp ảnh trực tiếp từ app.',
    camera_unavailable: 'Không tìm thấy hoặc không thể khởi động camera trên thiết bị.',
    captured_photos_title: 'Tác phẩm gần đây',
    no_photos_yet: 'Chưa có ảnh nào. Chụp hoặc tải ảnh lên để bắt đầu biến hóa!',
    upload_photo: 'Chọn ảnh từ máy',
    switch_camera: 'Đổi camera',
    quick_edit: 'Chỉnh sửa ngay',
    
    // Quick tools on Home
    quick_action_edit: 'Chỉnh sửa',
    quick_action_camera: 'Chụp HD',
    quick_action_enhance: 'Làm nét AI',
    quick_action_portrait: 'Chân dung',
    quick_action_filter: 'Bộ lọc hot',
    quick_action_erase: 'Xóa vật thể',
    
    // Editor screen
    editor_title: 'Studio Chỉnh Ảnh',
    before_label: 'Ảnh gốc',
    after_label: 'Sau khi chỉnh',
    style_label: 'Phong cách AI',
    extra_note_label: 'Ghi chú cho AI (Tùy chọn)',
    extra_note_placeholder: 'Ví dụ: da trắng hồng tự nhiên, thêm ánh nắng vàng chiều tà, mắt long lanh…',
    edit_with_ai: 'Xử lý bằng AI',
    processing: 'AI đang phân tích & sáng tạo…',
    ai_result_placeholder: 'Tác phẩm sau khi áp dụng AI sẽ xuất hiện tại đây',
    save_photo: 'Lưu ảnh',
    download_photo: 'Xuất ảnh',
    compare_mode: 'So sánh Before/After',
    hold_to_compare: 'Nhấn giữ xem ảnh gốc',
    back_to_home: 'Quay lại',
    delete_photo: 'Xóa ảnh',
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    reset_all: 'Khôi phục gốc',
    export_options: 'Tùy chọn xuất ảnh',
    export_quality: 'Chất lượng xuất',
    export_hd: 'Chuẩn HD (1080p)',
    export_2k: 'Siêu nét 2K (2160p)',
    export_original: 'Độ phân giải gốc',

    // Editor Tabs
    tab_ai_style: 'Phong cách',
    tab_portrait: 'Chân dung',
    tab_ai_tools: 'Công cụ AI',
    tab_filters: 'Bộ lọc',
    tab_adjust: 'Điều chỉnh',
    tab_crop: 'Cắt & Xoay',

    // Portrait Retouch tools
    retouch_smooth: 'Mịn da tự nhiên',
    retouch_tone: 'Trắng da sáng hồng',
    retouch_eyes: 'Ánh mắt long lanh',
    retouch_slim: 'Thon gọn khuôn mặt',
    retouch_blemish: 'Xóa khuyết điểm',

    // AI Tools
    ai_tool_enhance: 'Làm nét HD',
    ai_tool_enhance_desc: 'Khôi phục chi tiết mờ, tăng độ sắc nét vượt trội.',
    ai_tool_bg: 'Đổi nền AI',
    ai_tool_bg_desc: 'Tách nền thông minh và thay phông nền studio hiện đại.',
    ai_tool_lighting: 'Ánh sáng Studio',
    ai_tool_lighting_desc: 'Bổ sung nguồn sáng nghệ thuật, bokeh chiều sâu.',
    ai_tool_erase: 'Xóa vật thể',
    ai_tool_erase_desc: 'Loại bỏ người lạ hoặc chi tiết thừa trong khung hình.',

    // Adjust parameters
    adjust_brightness: 'Độ sáng',
    adjust_contrast: 'Tương phản',
    adjust_saturation: 'Bão hòa màu',
    adjust_warmth: 'Nhiệt độ màu',
    adjust_vignette: 'Mờ viền (Vignette)',
    adjust_sharpen: 'Sắc nét',
    reset_adjust: 'Đặt lại thông số',

    // Crop ratios
    crop_free: 'Tự do',
    crop_1_1: '1:1 (Vuông)',
    crop_4_3: '4:3 (Tiêu chuẩn)',
    crop_3_4: '3:4 (Chân dung)',
    crop_16_9: '16:9 (Ngang)',
    crop_9_16: '9:16 (Story/TikTok)',
    rotate_90: 'Xoay 90°',
    flip_horizontal: 'Lật ngang',

    // Filter categories
    filter_none: 'Gốc',
    filter_vintage: 'Cổ điển',
    filter_cinematic: 'Điện ảnh',
    filter_korean: 'Hàn Quốc',
    filter_cyber: 'Cyberpunk',
    filter_bw: 'Đen trắng nghệ thuật',
    filter_warm: 'Ấm áp',

    // Settings screen
    settings_title: 'Cài đặt hệ thống',
    settings_hint: 'Nhập Gemini API key để sử dụng các thuật toán tạo ảnh & chỉnh sửa thông minh.',
    gemini_api_key_label: 'Gemini API key',
    gemini_model_label: 'Mô hình AI (Model)',
    save: 'Lưu thay đổi',
    server_key_active: 'API key từ máy chủ đang hoạt động sẵn sàng.',
    language_label: 'Ngôn ngữ hiển thị',
    theme_label: 'Giao diện hiển thị',
    theme_dark: 'Giao diện Tối (Xingtu Dark)',
    theme_light: 'Giao diện Sáng (Hypic Clean)',
    theme_system: 'Theo hệ điều hành',

    // Update feature
    updates_section: 'Cập nhật ứng dụng',
    check_for_updates: 'Kiểm tra bản cập nhật',
    current_version: 'Phiên bản hiện tại',
    latest_version: 'Phiên bản mới nhất',
    up_to_date: 'Ứng dụng đang ở phiên bản mới nhất.',
    update_available_title: 'Có bản cập nhật mới!',
    update_downloading: 'Đang tải về bản cập nhật…',
    update_installing: 'Đang cài đặt bản cập nhật…',
    update_now: 'Tải về & Cập nhật ngay',
    update_later: 'Để sau',
    update_success: 'Cập nhật lên phiên bản {0} thành công!',
    release_notes: 'Nhật ký cập nhật',

    // Style names
    style_portrait: 'Chân dung',
    style_portrait_desc: 'Làm mịn da tự nhiên, bokeh mờ hậu cảnh ấm áp, làm nổi bật ánh mắt.',
    style_outdoor: 'Ngoại cảnh',
    style_outdoor_desc: 'Cân bằng sáng tự nhiên, tăng rực rỡ trời & cây cỏ phong cách điện ảnh nhẹ nhàng.',
    style_landscape: 'Phong cảnh',
    style_landscape_desc: 'Tăng dải tương phản dynamic range, mây trời sắc nét, độ sâu màu sắc chân thực.',
    style_people: 'Chụp người / đời thường',
    style_people_desc: 'Cân bằng da chuẩn tự nhiên khi nhiều người, ánh sáng đều, không xao nhãng.',
    style_graduation: 'Chụp kỷ yếu',
    style_graduation_desc: 'Tông màu tươi sáng, đồng nhất phong cách kỷ yếu, nổi bật nụ cười & lễ phục.',
    style_anime: 'Anime / Manga',
    style_anime_desc: 'Biến ảnh thật thành nét vẽ hoạt hình Nhật Bản lung linh giàu cảm xúc.',
    style_cyber: 'Cyberpunk Neon',
    style_cyber_desc: 'Ánh đèn neon tím xanh huyền ảo phong cách tương lai.',

    // Status messages
    status_photo_captured: 'Đã lưu khoảnh khắc: {0}',
    status_processing: 'AI đang tiến hành phân tích & tạo ảnh…',
    status_processing_done: 'Xử lý thành công!',
    status_photo_saved: 'Đã xuất ảnh thành công: {0}',
    status_settings_saved: 'Đã lưu cấu hình cài đặt.',

    // Error messages
    error_missing_api_key: 'Chưa có Gemini API key. Vào Cài đặt để nhập key hoặc dùng key mặc định.',
    error_no_photo_selected: 'Hãy chọn một ảnh để bắt đầu chỉnh sửa.',
    error_camera_not_ready: 'Camera chưa sẵn sàng. Hãy đợi luồng hình ảnh xuất hiện.',
    error_camera_init_failed: 'Không khởi tạo được camera: {0}',
    error_capture_failed: 'Chụp ảnh thất bại: {0}',
    error_style_not_found: 'Không tìm thấy phong cách: {0}',
    error_image_read_failed: 'Không đọc được ảnh: {0}',
    error_network_call_failed: 'Lỗi kết nối AI: {0}',
    error_api_http_error: 'Lỗi gọi API (HTTP {0}): {1}',
    error_no_candidates: 'AI không trả về kết quả nào.',
    error_prohibited_content: 'Nội dung ảnh bị chặn bởi bộ lọc an toàn.',
    error_no_content: 'AI không trả về nội dung hợp lệ.',
    error_no_image_in_response: 'Không tìm thấy dữ liệu ảnh sau khi xử lý.',
    error_image_decode_failed: 'Không giải mã được dữ liệu ảnh.',
    error_save_failed: 'Không thể xuất file: {0}',
    error_unknown: 'Đã xảy ra lỗi: {0}',
  },
  en: {
    app_name: 'PhotoAI Studio',
    app_subtitle: 'Xingtu / Hypic Aesthetic Photo Editor',
    capture_new_photo: 'Take HD Photo',
    capturing: 'Capturing…',
    camera_permission_rationale: 'Camera permission is required to capture photos directly.',
    camera_unavailable: 'Camera device is not available on this device.',
    captured_photos_title: 'Recent Projects',
    no_photos_yet: 'No photos yet. Capture or upload a photo to start editing!',
    upload_photo: 'Import Photo',
    switch_camera: 'Switch Camera',
    quick_edit: 'Edit Now',

    // Quick tools on Home
    quick_action_edit: 'Edit',
    quick_action_camera: 'HD Camera',
    quick_action_enhance: 'AI Enhance',
    quick_action_portrait: 'Portrait',
    quick_action_filter: 'Hot Filters',
    quick_action_erase: 'AI Erase',

    // Editor screen
    editor_title: 'Photo Studio',
    before_label: 'Original',
    after_label: 'Edited',
    style_label: 'AI Styles',
    extra_note_label: 'Extra Instruction (Optional)',
    extra_note_placeholder: 'e.g., natural radiant skin, golden hour sunlight, sparkling eyes…',
    edit_with_ai: 'Process with AI',
    processing: 'AI is analyzing and generating…',
    ai_result_placeholder: 'AI masterpiece will appear here',
    save_photo: 'Save Photo',
    download_photo: 'Export',
    compare_mode: 'Compare Before / After',
    hold_to_compare: 'Hold to view original',
    back_to_home: 'Back',
    delete_photo: 'Delete',
    undo: 'Undo',
    redo: 'Redo',
    reset_all: 'Reset All',
    export_options: 'Export Options',
    export_quality: 'Export Quality',
    export_hd: 'HD Standard (1080p)',
    export_2k: 'Ultra 2K (2160p)',
    export_original: 'Original Resolution',

    // Editor Tabs
    tab_ai_style: 'Styles',
    tab_portrait: 'Retouch',
    tab_ai_tools: 'AI Tools',
    tab_filters: 'Filters',
    tab_adjust: 'Adjust',
    tab_crop: 'Crop & Rotate',

    // Portrait Retouch tools
    retouch_smooth: 'Natural Smooth',
    retouch_tone: 'Skin Tone Glow',
    retouch_eyes: 'Bright Eyes',
    retouch_slim: 'Face Slim',
    retouch_blemish: 'Blemish Erase',

    // AI Tools
    ai_tool_enhance: 'AI HD Enhance',
    ai_tool_enhance_desc: 'Restore blurry details and enhance sharpness.',
    ai_tool_bg: 'AI Background',
    ai_tool_bg_desc: 'Smart cut-out and modern studio backdrop replace.',
    ai_tool_lighting: 'Studio Lighting',
    ai_tool_lighting_desc: 'Add soft cinematic lighting & deep bokeh.',
    ai_tool_erase: 'Object Remover',
    ai_tool_erase_desc: 'Clean up bystanders and unwanted background items.',

    // Adjust parameters
    adjust_brightness: 'Brightness',
    adjust_contrast: 'Contrast',
    adjust_saturation: 'Saturation',
    adjust_warmth: 'Warmth / Temp',
    adjust_vignette: 'Vignette',
    adjust_sharpen: 'Sharpen',
    reset_adjust: 'Reset Adjustments',

    // Crop ratios
    crop_free: 'Free',
    crop_1_1: '1:1 (Square)',
    crop_4_3: '4:3 (Standard)',
    crop_3_4: '3:4 (Portrait)',
    crop_16_9: '16:9 (Landscape)',
    crop_9_16: '9:16 (Story/Reels)',
    rotate_90: 'Rotate 90°',
    flip_horizontal: 'Flip Horizontal',

    // Filter categories
    filter_none: 'Original',
    filter_vintage: 'Vintage Film',
    filter_cinematic: 'Cinematic',
    filter_korean: 'K-Beauty',
    filter_cyber: 'Cyberpunk',
    filter_bw: 'Dramatic B&W',
    filter_warm: 'Warm Amber',

    // Settings screen
    settings_title: 'Settings',
    settings_hint: 'Enter a Gemini API key to power cutting-edge AI generation and portrait models.',
    gemini_api_key_label: 'Gemini API key',
    gemini_model_label: 'Gemini Model',
    save: 'Save Changes',
    server_key_active: 'Server system API key is active and ready.',
    language_label: 'Display Language',
    theme_label: 'Theme Appearance',
    theme_dark: 'Dark Mode (Xingtu Dark)',
    theme_light: 'Light Mode (Hypic Clean)',
    theme_system: 'Follow System',

    // Update feature
    updates_section: 'Application Updates',
    check_for_updates: 'Check for Updates',
    current_version: 'Current Version',
    latest_version: 'Latest Version',
    up_to_date: 'You have the latest version installed.',
    update_available_title: 'New Update Available!',
    update_downloading: 'Downloading update package…',
    update_installing: 'Installing update…',
    update_now: 'Download & Install Now',
    update_later: 'Remind Me Later',
    update_success: 'Successfully updated to version {0}!',
    release_notes: 'Release Notes',

    // Style names
    style_portrait: 'Portrait',
    style_portrait_desc: 'Skin smoothing, warm soft bokeh, eye focus.',
    style_outdoor: 'Outdoor',
    style_outdoor_desc: 'Natural lighting balance, vibrant sky and landscape.',
    style_landscape: 'Landscape',
    style_landscape_desc: 'Dynamic range, sharp clouds, lifelike depth.',
    style_people: 'People / Daily',
    style_people_desc: 'Natural group skin tone balance, clean background.',
    style_graduation: 'Graduation',
    style_graduation_desc: 'Vibrant celebratory mood, clear graduation gown details.',
    style_anime: 'Anime Manga',
    style_anime_desc: 'Transform into Japanese anime illustration aesthetic.',
    style_cyber: 'Cyberpunk Neon',
    style_cyber_desc: 'Futuristic neon purple & cyan night cityscape.',

    // Status messages
    status_photo_captured: 'Captured photo: {0}',
    status_processing: 'AI is processing your photo…',
    status_processing_done: 'Processing finished!',
    status_photo_saved: 'Exported successfully: {0}',
    status_settings_saved: 'Settings saved.',

    // Error messages
    error_missing_api_key: 'No Gemini API key configured. Check settings.',
    error_no_photo_selected: 'Please choose a photo to edit.',
    error_camera_not_ready: 'Camera is initializing, please wait.',
    error_camera_init_failed: 'Camera error: {0}',
    error_capture_failed: 'Failed to capture photo: {0}',
    error_style_not_found: 'Style not found: {0}',
    error_image_read_failed: 'Cannot read photo: {0}',
    error_network_call_failed: 'Network / AI error: {0}',
    error_api_http_error: 'Gemini API error (HTTP {0}): {1}',
    error_no_candidates: 'AI returned no results.',
    error_prohibited_content: 'Image was filtered by safety filters.',
    error_no_content: 'AI returned empty output.',
    error_no_image_in_response: 'No image data returned from AI.',
    error_image_decode_failed: 'Failed to decode image data.',
    error_save_failed: 'Failed to export image: {0}',
    error_unknown: 'An unknown error occurred: {0}',
  },
};

export const STYLES_LIST = [
  {
    key: 'portrait',
    tag: 'HOT',
    prompt:
      'Hay chinh sua anh chan dung nay mot cach chuyen nghiep: lam min da tu nhien ' +
      '(khong lam mat ket cau da that), can bang tong mau da, lam noi bat doi mat, ' +
      'tang nhe do sac net o khuon mat, lam mo nhe hau canh theo kieu chup ong kinh ' +
      'khau do lon (bokeh) neu phu hop, anh sang am va de chiu. Giu nguyen danh tinh ' +
      'va dac diem khuon mat cua nguoi trong anh, khong thay doi cau truc guong mat.',
  },
  {
    key: 'outdoor',
    tag: 'PRO',
    prompt:
      'Hay chinh sua anh chup ngoai canh nay: can bang sang/toi tu nhien, tang nhe do ' +
      'ruc ro cua bau troi va cay coi mot cach chan thuc (khong qua da), dieu chinh ' +
      'can bang trang cho dung voi anh sang tu nhien, tao cam giac dien anh nhe nhang ' +
      'nhung van tu nhien, giu nguyen bo cuc va chu the trong anh.',
  },
  {
    key: 'landscape',
    tag: 'NATURE',
    prompt:
      'Hay chinh sua anh phong canh nay theo phong cach nhiep anh thien nhien chuyen ' +
      'nghiep: tang dai tuong phan dong (dynamic range), lam bau troi va may ro net ' +
      'hon, tang do sau mau sac mot cach chan thuc, lam noi bat chi tiet o tien canh ' +
      'va hau canh, sac net vua phai, khong chinh sua qua muc lam mat tinh tu nhien.',
  },
  {
    key: 'people',
    tag: 'DAILY',
    prompt:
      'Hay chinh sua anh chup nguoi nay theo phong cach tu nhien, doi thuong: can ' +
      'bang mau da chuan voi nhieu nguoi trong anh, chinh sang deu, giu mau sac trung ' +
      'thuc, lam sach nhe cac chi tiet gay xao nhang o hau canh neu co, giu nguyen ' +
      'bieu cam va dang dung tu nhien cua moi nguoi.',
  },
  {
    key: 'graduation',
    tag: 'STUDIO',
    prompt:
      'Hay chinh sua anh ky yeu/tot nghiep nay: tong mau tuoi sang, ruc ro, vui tuoi, ' +
      'dong nhat ve tong mau de phu hop khi ghep chung voi cac anh ky yeu khac, lam ' +
      'noi bat nu cuoi va anh sang tren khuon mat, mau sac dong phuc/ao cu nhan ro ' +
      'net, co the them chut vignette nhe o vien anh cho noi bat chu the.',
  },
  {
    key: 'anime',
    tag: 'AI MAGIC',
    prompt:
      'Hay chuyen the anh nay thanh buc hoa phong cach Anime Nhat Ban chat luong cao ' +
      '(Makoto Shinkai/Ghibli aesthetic): mau sac tuoi sang ruc ro, bau troi xanh trong ' +
      'may bong benh, anh sang lap lanh, duong net ve mem mai nhung van giu dac diem ' +
      'chu the goc mot cach tinh te.',
  },
  {
    key: 'cyber',
    tag: 'TREND',
    prompt:
      'Hay bien hoa anh nay theo phong cach Cyberpunk Neon City: phoi mau neon xanh cyan ' +
      'va tim hong huyen ao, tang do tuong phan den sau va anh sang den neon ruc ro, ' +
      'hieu ung phan chieu dien anh hien dai.',
  },
];

export const RETOUCH_PRESETS = [
  {
    key: 'smooth',
    prompt: 'Chinh sua lam min da tu nhien, giu ket cau lo chan long chan thuc, xoa vet tham, can bang do sang khuon mat.',
  },
  {
    key: 'tone',
    prompt: 'Nang tong da trang hong tu nhien, sang deu mau, khong bi bết dính, tao do bong tu nhien (glass skin).',
  },
  {
    key: 'eyes',
    prompt: 'Lam sang va long lanh doi mat, ro net dong tu, xoa quang tham va bong mat, anh mat trong veo quyen ru.',
  },
  {
    key: 'slim',
    prompt: 'Tinh chinh goc mat V-line thon gon tu nhien nhe nhang, can doi ty le guong mat hai hoa, giu net dac trung.',
  },
  {
    key: 'blemish',
    prompt: 'Xoa sach cac vet mun, seo tham, nếp nhăn và khuyet diem tren da mot cach ti mi, giu nguyen duong net that.',
  },
];

export const AI_TOOLS_PRESETS = [
  {
    key: 'enhance',
    prompt: 'Hay khoi phuc va lam net anh nay (AI Super-Resolution HD): tang cuong do phan giai, lam ro chi tiet toc, mat, da va quan ao, giam nhieu (denoise) toi da.',
  },
  {
    key: 'bg',
    prompt: 'Hay tach chu the va thay the hau canh thanh studio chup anh cao cap phong cach toi gian hien dai voi anh sang mem mai.',
  },
  {
    key: 'lighting',
    prompt: 'Bo sung anh sang studio chuyen nghiep: hieu ung den ven (rim light) vien chu the, anh sang am ap ruc ro nhu gio vang.',
  },
  {
    key: 'erase',
    prompt: 'Xoa bo cac chi tiet gay xao nhang o hau canh, nguoi la va rac thai xung quanh de lam noi bat chu the chinh.',
  },
];

export const FILTER_PRESETS = [
  {
    id: 'none',
    nameVi: 'Gốc',
    nameEn: 'Original',
    category: 'all',
    thumbnailColor: 'bg-slate-500',
    cssFilter: 'none',
  },
  {
    id: 'vintage',
    nameVi: 'Film Cổ Điển',
    nameEn: 'Vintage 35mm',
    category: 'vintage',
    thumbnailColor: 'bg-amber-600',
    cssFilter: 'sepia(0.35) contrast(1.15) brightness(0.95) saturate(1.1)',
  },
  {
    id: 'cinematic',
    nameVi: 'Điện Ảnh Teal',
    nameEn: 'Teal & Orange',
    category: 'cinematic',
    thumbnailColor: 'bg-teal-600',
    cssFilter: 'contrast(1.2) saturate(1.25) hue-rotate(-10deg)',
  },
  {
    id: 'korean',
    nameVi: 'Hàn Quốc Tươi',
    nameEn: 'K-Fresh Glow',
    category: 'portrait',
    thumbnailColor: 'bg-rose-400',
    cssFilter: 'brightness(1.12) contrast(0.95) saturate(1.15)',
  },
  {
    id: 'cyber',
    nameVi: 'Neon Tím',
    nameEn: 'Cyber Violet',
    category: 'trendy',
    thumbnailColor: 'bg-purple-600',
    cssFilter: 'contrast(1.3) hue-rotate(50deg) saturate(1.4)',
  },
  {
    id: 'warm',
    nameVi: 'Nắng Ấm',
    nameEn: 'Golden Hour',
    category: 'warm',
    thumbnailColor: 'bg-orange-500',
    cssFilter: 'sepia(0.2) saturate(1.3) brightness(1.05)',
  },
  {
    id: 'bw',
    nameVi: 'Đen Trắng Pro',
    nameEn: 'Noir B&W',
    category: 'bw',
    thumbnailColor: 'bg-zinc-800',
    cssFilter: 'grayscale(1) contrast(1.35) brightness(0.95)',
  },
];
