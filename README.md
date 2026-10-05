# BÁO CÁO BÀI TẬP GIỮA KỲ - MÔN: ĐIỆN TOÁN ĐÁM MÂY

**Đề tài:** Ứng dụng Web Quản lý Sách trên Hạ tầng Đám mây (Cloud Computing)  
**Sinh viên thực hiện:** Nguyễn Thị Thủy Tiên  
**Mã số sinh viên (MSSV):** `23IT273`  
**Database Atlas:** `DB_23IT273`  

---

## 1. Kiến trúc Bảo mật Cơ sở dữ liệu Cloud (Least Privilege)
- **Tên cơ sở dữ liệu trên MongoDB Atlas:** `DB_23IT273`
- **Áp dụng nguyên tắc đặc quyền tối thiểu (Least Privilege):**
  - **Tài khoản Đọc (Read-only User):** Gắn với MSSV, chỉ cấp quyền `read` trên cơ sở dữ liệu `DB_23IT273`. Dùng riêng cho các tác vụ truy vấn danh sách sách.
  - **Tài khoản Ghi (Write User):** Gắn với MSSV, chỉ cấp quyền `readWrite` trên cơ sở dữ liệu `DB_23IT273`. Dùng riêng cho các tác vụ thêm mới sách và quản lý session.

## 2. Logic Backend & Kiến trúc Stateless
- **Đa luồng kết nối (Dual Database Connections):**
  - Sử dụng `mongoose.createConnection()` thiết lập 2 connection pool độc lập: một kết nối sử dụng tài khoản Read và một kết nối sử dụng tài khoản Write.
  - Tự động điều hướng: Route `GET` (đọc dữ liệu) sử dụng Read Connection; Route `POST` (thêm mới dữ liệu) sử dụng Write Connection.
- **Stateless Session:**
  - Không lưu Session/Cookie trên RAM máy chủ (đáp ứng khả năng Auto-scaling đa instance không lo mất session).
  - Tích hợp `connect-mongo` lưu trữ tập trung Session trực tiếp xuống Cloud MongoDB Atlas trong collection `sessions`.
- **Thuật toán cá nhân hóa theo MSSV 23IT273:**
  - **Bộ lọc mã sản phẩm:** Mã sách bắt buộc phải bắt đầu bằng **3 số cuối MSSV** là `273` (Ví dụ: `273-BK01`, `273-CLOUD`). Nếu không đúng tiền tố này, hệ thống sẽ từ chối xử lý và trả về thông báo lỗi.
  - **Mức thuế VAT động:** `VAT = (Chữ số cuối MSSV + 5)% = (3 + 5)% = 8%`.
  - Hệ thống tự động tính giá sau thuế (`priceWithVAT = price * 1.08`) trước khi lưu xuống cơ sở dữ liệu MongoDB Atlas.
  - Giao diện sử dụng Template Engine **Handlebars** với Footer cố định hiển thị: **Họ tên: Tiến | MSSV: 23IT273 | Mức VAT áp dụng: 8%**.

## 3. Quy trình Quản lý Mã nguồn & DevOps
- Bảo mật thông tin nhạy cảm: Toàn bộ file cấu hình `.env`, thư mục `node_modules` được đưa vào `.gitignore`.
- Quy trình phân nhánh Git:
  - Nhánh `feature/database`: Triển khai kết nối đa luồng Read/Write và nghiệp vụ dữ liệu sách.
  - Nhánh `feature/session`: Triển khai kiến trúc Stateless Session lưu trữ trên MongoDB Atlas.
  - Merge về `main` với cờ `--no-ff` (No Fast-Forward) để lưu lại toàn bộ các nút gộp (Merge Nodes) trên sơ đồ Git Graph.

## 4. Triển khai Hệ thống thực tế (PaaS Render)
- Mã nguồn được lưu trữ trên GitHub ở chế độ Private và cấp quyền cho Giảng viên.
- Triển khai ứng dụng chạy trực tuyến 24/7 trên nền tảng Cloud PaaS Render.
- Toàn bộ biến môi trường mật (`MONGODB_READ_URI`, `MONGODB_WRITE_URI`, `SESSION_SECRET`,...) được cấu hình thông qua bảng điều khiển Environment Variables của Render.

---

## Hướng dẫn chạy ứng dụng ở Local

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình môi trường:**
   Tạo file `.env` từ `.env.example`:
   ```env
   PORT=3000
   MONGODB_READ_URI=mongodb+srv://<user_read>:<password>@cluster0.of2fopb.mongodb.net/DB_23IT273?retryWrites=true&w=majority
   MONGODB_WRITE_URI=mongodb+srv://<user_write>:<password>@cluster0.of2fopb.mongodb.net/DB_23IT273?retryWrites=true&w=majority
   SESSION_SECRET=secret_key_cloud_giuaky_23it273
   STUDENT_NAME=Tiến
   STUDENT_MSSV=23IT273
   ```

3. **Khởi chạy ứng dụng:**
   ```bash
   npm start
   ```
   Truy cập vào trình duyệt: `http://localhost:3000`
