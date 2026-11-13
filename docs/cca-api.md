# CCA API trực tiếp

Frontend gọi trực tiếp API `/api/v1` của `next-pro-cca-admin`.
`src/features/cca/api.ts` đọc `NEXT_PUBLIC_CCA_API_URL`; request thường và request bỏ bài khi rời trang cùng dùng URL này và `credentials: include`.

- Development hiện có: FE `http://localhost:3000`, BE `http://localhost:3001`; `.env.local` của FE đặt `NEXT_PUBLIC_CCA_API_URL=http://localhost:3001`.
- URL có thể là origin hoặc base đầy đủ `/api/v1`; frontend thêm `/api/v1` đúng một lần và bỏ dấu `/` cuối.
- Không cấu hình thì mặc định `https://cca.dev-pro.online/api/v1`.
- Workflow GitHub Pages bắt buộc đọc repository variable `NEXT_PUBLIC_CCA_API_URL`; không chứa URL API cố định trong YAML. Vào GitHub repository → Settings → Secrets and variables → Actions → Variables, tạo `NEXT_PUBLIC_CCA_API_URL` bằng origin backend production. Nếu thiếu biến, workflow dừng với thông báo cấu hình. `NEXT_PUBLIC_BASE_PATH` là biến tùy chọn, để trống khi dùng custom domain. Next.js nhúng URL vào bundle lúc build; đổi biến cần restart dev hoặc rebuild/redeploy frontend.
- Backend local hiện cho phép origin `http://localhost:3000`. Dùng FE cùng hostname `localhost` để cookie `SameSite=Lax` hoạt động; không trộn `127.0.0.1` với `localhost` khi kiểm thử thật.

Nếu production trả HTML 404 tại `/api/v1/auth/session`, cần kiểm tra bản triển khai hoặc domain backend; không thay đường dẫn API vốn đã được khai báo trong source backend để né lỗi này.
Không cần proxy hoặc cấu hình Cloudflare cho cách gọi này. Build frontend bằng `npm run build`, deploy thư mục `out` như workflow hiện tại.

## Backend duy nhất: next-pro-cca-admin

API được triển khai trong repo `../next-pro-cca-admin` (Next.js + PostgreSQL).
`next-pro` chỉ chứa giao diện CCA, không chạy backend thi riêng.
Đã bỏ backend OTP/SQLite `services/cca-api`, script tạo mã phòng, cấu hình env và E2E của luồng cũ.
Ngân hàng câu hỏi được quản lý tại `next-pro-cca-admin/data`; không giữ bản trùng trong frontend.

Contract frontend sử dụng:

- Auth: `POST /api/v1/auth/login`, `POST /api/v1/auth/setup-password`, `GET /api/v1/auth/session`, `POST /api/v1/auth/logout`.
- Exam: `GET /api/v1/exams/catalog`, `GET /api/v1/exams/dashboard`, `POST /api/v1/exams/attempts`.
- Attempt: `GET /api/v1/exams/attempts/:id`, `PUT /api/v1/exams/attempts/:id/answers`, `POST /api/v1/exams/attempts/:id/submit`, `POST /api/v1/exams/attempts/:id/abandon`.

Đăng nhập dùng username, mật khẩu cá nhân và HttpOnly cookie. Không còn OTP/mã phòng.

## Luồng đăng nhập và đặt mật khẩu trên frontend

- `/login` gửi `POST /auth/login` với `{ username }` đã trim/lowercase, không gửi password rỗng.
- API trả `{ needPassword: true, username }` cho tài khoản cần mật khẩu. Frontend hiện bước nhập password và gửi lại `{ username, password }`; phản hồi này chưa cấp quyền vào phòng thi.
- API trả `{ session: { kind: "password_setup", ... } }` và tự đặt cookie HttpOnly cho tài khoản cần kích hoạt. Frontend chuyển bằng `router.replace('/setup-password')`.
- `/setup-password` luôn gọi `GET /auth/session` khi mở hoặc tải lại. Chỉ phiên `password_setup` mới được thấy form đặt mật khẩu; không có phiên thì về `/login`, đã xác thực thì vào `/account`.
- Form yêu cầu 12–128 ký tự, xác nhận khớp; gửi `POST /auth/setup-password` với `{ password, confirmPassword }`. Chỉ khi API trả phiên `authenticated` mới chuyển sang `/account` và tải danh sách đề.
- `/account` kiểm tra phiên khi mở hoặc tải lại: chưa đăng nhập thì chuyển `/login`, phiên setup thì chuyển `/setup-password`. Đăng xuất thành công về `/login`.
- `/cca` giữ vai trò đường dẫn tương thích: kiểm tra phiên rồi chuyển đến `/login`, `/setup-password` hoặc `/account`. Menu Thi Claude dùng `/login`; đường dẫn `/cca` cũ vẫn hoạt động.
- Phiên setup không tải catalog/dashboard. Mật khẩu và token không được lưu ở localStorage/sessionStorage; cookie do API quản lý.
- API phải giới hạn phiên setup, kiểm tra password đối với tài khoản đã có hash, và thu hồi/đổi phiên khi kích hoạt. Frontend không tự cấp phiên hoặc tự chuyển trạng thái user. Những yêu cầu này cần backend đang triển khai hỗ trợ; thay đổi frontend không tự thay đổi backend.
  Kiểm thử backend được duy trì trong `next-pro-cca-admin/tests/integration` và `tests/e2e/cca-cookie.spec.ts`.

## Cấu hình backend production

- Backend phải có DNS và HTTPS hoạt động tại `cca.dev-pro.online`.
- `APP_ORIGIN=https://cca.dev-pro.online`.
- `CCA_ALLOWED_ORIGINS=https://dev-pro.online` (thêm origin local bằng dấu phẩy nếu cần).
- CORS phải trả đúng origin frontend, `Access-Control-Allow-Credentials: true` và xử lý OPTIONS cho các request JSON/PUT.

Frontend `https://dev-pro.online` và API `https://cca.dev-pro.online` khác origin nhưng cùng site. Cookie API host-only `SameSite=Lax; Secure; HttpOnly; Path=/` phù hợp, không cần đổi sang `SameSite=None` hay chia sẻ cookie cho domain cha. Frontend gửi `credentials: include`; backend cho phép chính xác origin frontend và xử lý preflight. Không dùng domain thiếu dấu gạch ngang `cca.devpro.online`.

Tài liệu này ghi nhận yêu cầu triển khai; thay đổi ở frontend không tự sửa cấu hình/cookie backend hay triển khai production.
