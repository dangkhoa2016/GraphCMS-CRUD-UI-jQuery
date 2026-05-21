# Giao diện Quản trị CRUD GraphCMS (jQuery)

> 🌐 Language / Ngôn ngữ: [English](readme.md) | **Tiếng Việt**

Một ứng dụng trang đơn (SPA) tĩnh cung cấp đầy đủ chức năng CRUD (Thêm, Đọc, Sửa, Xóa) để quản lý **Tác giả (Authors)**, **Bài viết (Posts)**, và **Bình luận (Comments)** thông qua GraphQL API của [Hygraph](https://hygraph.com/) (trước đây là GraphCMS).

## Tính năng

* **Xác thực** — Đăng nhập dựa trên cookie ở phía client (truy cập vào bảng điều khiển admin).
* **Quản lý Tác giả** — Tạo, sửa, xóa tác giả với các thông tin: tên, email, trạng thái, điểm số, ngày sinh, số điện thoại.
* **Quản lý Bài viết** — Tạo, sửa, xóa bài viết với các thông tin: tiêu đề, nội dung (RichText AST), tóm tắt, ảnh, chỉ định tác giả và trạng thái xuất bản.
* **Quản lý Bình luận** — Tạo, sửa, xóa các bình luận được liên kết với bài viết và tác giả.
* **Tích hợp DataTables** — Các bảng dữ liệu có khả năng sắp xếp, tìm kiếm và phân trang cho từng thực thể.
* **Cơ chế Dự phòng Ảnh (Image Fallback)** — Tự động tải trước hình ảnh và tự động chuyển sang ảnh mặc định (placeholder) nếu ảnh gốc bị lỗi.
* **Form dạng Modal** — Sử dụng các chỉ báo tải dữ liệu của SweetAlert2 kết hợp với modal Bootstrap để xác nhận khi tạo/sửa/xóa.
* **Định tuyến SPA** — Tải bố cục/nội dung động thông qua các thẻ HTML tùy chỉnh (`<layout>`, `<sidebar>`, `<header>`, `<content>`, `<modals>`).

## Công nghệ Sử dụng

| Danh mục | Thư viện |
| --- | --- |
| Cốt lõi (Core) | Vanilla JS (ES6+), jQuery 3.6 |
| Framework UI | Bootstrap 4.6, AdminLTE 3 |
| Hệ thống Template | Handlebars 4.7 |
| Bảng dữ liệu | DataTables (với giao diện Bootstrap 4) |
| Thông báo | SweetAlert2 |
| Tiện ích | accounting-js, dayjs |
| Icon | Font Awesome |
| API | GraphQL (Hygraph/GraphCMS) |

**Không cần bước build** — không sử dụng bộ đóng gói (bundler), trình biên dịch mã (transpiler) hay trình quản lý gói (package manager). Tất cả các thư viện phụ thuộc đều được tải qua các thẻ `<script>` từ CDN.

## Cấu trúc Dự án

```
GraphCMS-CRUD-UI-jQuery/
├── index.html                    # Điểm khởi đầu gốc — tải các thư viện CDN, cấu hình và script chính
├── pages/
│   ├── login.html                # Trang đăng nhập độc lập
│   ├── users.html                # Trang danh sách tác giả (tải users.js)
│   ├── posts.html                # Trang danh sách bài viết (tải posts.js)
│   └── comments.html             # Trang danh sách bình luận (tải comments.js)
├── parts/
│   ├── layout.html               # Khung bố cục chính của AdminLTE
│   ├── sidebar.html              # Thanh menu bên sườn (giao diện tối) chứa menu điều hướng
│   ├── header.html               # Thanh điều hướng phía trên chứa menu người dùng, thông báo
│   └── modals.html               # Các modal Bootstrap (form, xác nhận, thông báo)
├── content/
│   ├── index.html                # Trang giao diện chính (Dashboard placeholder)
│   ├── users.html                # Template DataTable cho người dùng
│   ├── posts.html                # Template DataTable cho bài viết
│   ├── comments.html             # Template DataTable cho bình luận
│   ├── user_form.html            # Form Handlebars: tên, email, trạng thái, điểm số, ngày sinh, số điện thoại
│   ├── post_form.html            # Form Handlebars: tiêu đề, nội dung, trạng thái, tóm tắt, ảnh, tác giả
│   └── comment_form.html         # Form Handlebars: bình luận, bài viết, trạng thái, tác giả
├── assets/
│   ├── css/
│   │   └── styles.css            # Styles tùy chỉnh (hiệu ứng loader, ghi đè CSS)
│   ├── images/
│   │   ├── favicon.ico
│   │   ├── favicon.png
│   │   └── default.jpg           # Ảnh dự phòng cho các bài viết bị lỗi ảnh
│   └── js/
│       ├── config.js             # Cấu hình tập trung: API endpoint, thông tin đăng nhập, đường dẫn CDN
│       ├── script.js             # Bộ điều phối chính: xác thực, tải bố cục, định tuyến (routing)
│       ├── api-service.js        # Dịch vụ gọi truy vấn GraphQL (dựa trên fetch)
│       ├── helper.js             # Tiện ích cookie, chuyển đổi form thành dữ liệu, Handlebars helper, tiện ích xử lý ảnh
│       ├── crud-base.js          # Bộ điều khiển CRUD tái sử dụng (DataTable + logic lưu/xóa)
│       ├── form.js               # Lớp ModalForm (hiển thị/ẩn modal, liên kết dữ liệu form)
│       ├── users.js              # Cấu hình thực thể Tác giả (truy vấn, cột hiển thị, kiểm tra dữ liệu)
│       ├── posts.js              # Cấu hình thực thể Bài viết (truy vấn, cột hiển thị, kiểm tra dữ liệu)
│       └── comments.js           # Cấu hình thực thể Bình luận (truy vấn, cột hiển thị, kiểm tra dữ liệu)

```

## Kiến trúc

### Luồng Hoạt động của Ứng dụng

1. **Khởi chạy** — `index.html` tải tuần tự các thư viện từ CDN, sau đó đến `config.js` và cuối cùng là `script.js`.
2. **Kiểm tra Xác thực** — `script.js` kiểm tra cookie admin; nếu không tồn tại, ứng dụng sẽ chuyển hướng về `/pages/login.html`.
3. **Đăng nhập** — Thông tin tài khoản được đối chiếu với các giá trị hardcode (ghi trực tiếp) trong `config.js`; nếu thành công, ứng dụng sẽ tạo một cookie xác thực mã hóa base64 và chuyển hướng.
4. **Lắp ráp Bố cục** — Các thẻ HTML tùy chỉnh (`<layout>`, `<sidebar>`, `<header>`, `<modals>`) sẽ được thay thế bằng cách tải các tệp giao diện thành phần (partials) tương ứng từ thư mục `/parts/`.
5. **Chèn Nội dung** — Thẻ `<content>` được lấp đầy dựa trên đường dẫn URL hiện tại (ví dụ: `/pages/users.html` → `/content/users.html`).
6. **Khởi tạo Module** — Các tệp JS riêng của từng thực thể sẽ khai báo `window.addition_libs` để tải động các thư viện bổ sung cần thiết; mỗi thực thể sẽ khởi tạo một thực thể `CrudBase` đi kèm với các truy vấn GraphQL và cấu hình DataTable của riêng nó.

### Các Module Chính

* **`ApiService`** (`api-service.js`) — Bọc hàm `fetch` cho các yêu cầu POST của GraphQL. Cung cấp các hàm `query()`, `queryAjax()`, `getEndpoint()`.
* **`CrudBase`** (`crud-base.js`) — Bộ điều khiển tái sử dụng giúp khởi tạo một DataTable, gắn sự kiện cho các nút Thêm/Sửa/Xóa, xử lý việc gửi form thông qua `ModalForm` và thực thi các mutation (thao tác thay đổi dữ liệu) GraphQL với phản hồi giao diện từ SweetAlert2.
* **`ModalForm`** (`form.js`) — Quản lý các modal Bootstrap cho việc tạo/sửa/xóa. Biên dịch các template Handlebars, liên kết sự kiện gửi form và chuyển giao logic lưu dữ liệu cho `CrudBase`.
* **`helper.js`** — Quản lý cookie (`SetCookie`/`GetCookie`/`EraseCookie`), tuần tự hóa form (`GetFormData`), phân tích tham số URL, mã hóa xác thực base64, cắt ngắn chuỗi, các bộ hỗ trợ Handlebars (`formatTime`, `ifCond`, `select`) và các tiện ích tải trước/dự phòng hình ảnh.

### Module Riêng của Từng Thực thể

Mỗi thực thể (`users.js`, `posts.js`, `comments.js`) xuất (export) một đối tượng cấu hình cho `CrudBase`:

| Thực thể | Truy vấn GraphQL | Các Cột DataTable | Các Trường trong Form |
| --- | --- | --- | --- |
| **Tác giả** | `authors`, `author` (theo ID), `createAuthor`, `updateAuthor`, `deleteAuthor` | Tên, Email, Số lượng bài viết, Điểm số, Ngày tháng, Hành động | Tên, Email, Trạng thái, Điểm số, Ngày sinh, Số điện thoại |
| **Bài viết** | `posts`, `post` (theo ID), `authors` (danh sách thả xuống), `createPost`, `updatePost`, `deletePost` | Tiêu đề, Tóm tắt, Ảnh, Tác giả, Ngày tháng, Hành động | Tiêu đề, Nội dung, Trạng thái, Tóm tắt, URL Ảnh, Tác giả |
| **Bình luận** | `comments`, `authors` (thả xuống), `posts` (thả xuống), `createComment`, `updateComment`, `deleteComment` | Bình luận, Bài viết, Tác giả, Ngày tháng, Hành động | Bình luận, Bài viết, Trạng thái, Tác giả |

## Cấu hình

Chỉnh sửa tệp `assets/js/config.js` để tùy chỉnh:

```js
const config = {
  API_ENDPOINT: 'https://eu-central-1.cdn.hygraph.com/content/.../master',
  AUTH: { user: 'admin', password: 'admin' },
  CDN: { /* URL CDN của các thư viện */ },
  LOGIN_PATH: '/pages/login',
  LAYOUT_FILES: ['/parts/layout.html', '/parts/sidebar.html', ...]
};

```

## Triển khai (Deployment)

Vì đây là một ứng dụng hoàn toàn tĩnh (static application), nó có thể được chạy bởi bất kỳ máy chủ tệp tĩnh nào:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .

# PHP
php -S localhost:8000

```

**CORS**: Endpoint của Hygraph/GraphCMS phải được cấu hình để cho phép các yêu cầu CORS từ tên miền (origin) mà bạn đang triển khai ứng dụng.

## Quy ước Mã nguồn (Code Conventions)

* Thụt lề 2 khoảng trắng (2-space) cho JS và CSS.
* Bắt buộc sử dụng dấu chấm phẩy (`;`).
* Sử dụng dấu nháy đơn (`'`) cho các chuỗi văn bản.
* Các đối tượng jQuery được tiền tố bằng dấu `$` (ví dụ: `$form`, `$table`).
* Các module xuất các biến toàn cục thông qua mô hình IIFE: `window.ModuleName = (function() { ... return { ... }; })();`

## Lưu ý về Bảo mật

> Dự án này chỉ sử dụng phương thức xác thực phía client nên có một số hạn chế đã biết về bảo mật:

* **Thông tin tài khoản bị hardcode** — Tài khoản `admin`/`admin` nằm ngay trong tệp `config.js`.
* **Xác thực Base64 trong cookie** — Sử dụng hàm `btoa()` (đây chỉ là mã hóa định dạng, không phải mã hóa bảo mật); cookie thiếu các thuộc tính an toàn như `Secure`, `HttpOnly`, `SameSite`.
* **Dữ liệu Handlebars không được unescape** — Việc dùng `{{{content}}}`, `{{{summary}}}`, `{{{comment}}}` trong các template form sẽ render trực tiếp mã HTML thô (nguy cơ XSS).
* **Không có cơ chế bảo vệ CSRF** cho các yêu cầu POST.
* **Phụ thuộc vào CDN bên thứ ba** — Giao diện AdminLTE được tải từ `admin-lte-cdn.surge.sh` (một CDN của bên thứ ba).

## Bản quyền (License)

Dự án này được cấp phép theo các điều khoản của Giấy phép MIT — xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.
