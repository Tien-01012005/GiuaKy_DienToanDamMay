require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const bookRoutes = require('./src/routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Phục vụ thư mục static (CSS, JS, hình ảnh)
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình Template Engine Handlebars
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src/views/layouts'),
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware cung cấp thông tin sinh viên cố định cho tất cả các view (Footer bắt buộc)
app.use((req, res, next) => {
  res.locals.studentName = process.env.STUDENT_NAME || 'Tiến';
  res.locals.studentMSSV = process.env.STUDENT_MSSV || '23IT273';
  // Chữ số cuối MSSV = 3 => VAT = (3 + 5)% = 8%
  res.locals.vatRate = 8;
  next();
});

// Định tuyến Quản lý Sách (Read/Write Dual Connection)
app.use('/', bookRoutes);

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server đang chạy trên cổng: http://localhost:${PORT}`);
  console.log(`👤 Sinh viên: ${process.env.STUDENT_NAME || 'Tiến'} - MSSV: ${process.env.STUDENT_MSSV || '23IT273'}`);
  console.log(`📊 Mức VAT áp dụng: 8% (Chữ số cuối 3 + 5)%`);
  console.log(`====================================================`);
});
