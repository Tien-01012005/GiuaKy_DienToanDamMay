const mongoose = require('mongoose');

// Tạo 2 connection độc lập theo nguyên tắc Least Privilege (Đặc quyền tối thiểu)
// 1. Connection Read-Only (Chỉ có quyền đọc)
const readConn = mongoose.createConnection(process.env.MONGODB_READ_URI, {
  serverSelectionTimeoutMS: 5000,
});

readConn.on('connected', () => {
  console.log('✅ [MongoDB Cloud - Read Pool]: Kết nối thành công bằng tài khoản Read-Only');
});

readConn.on('error', (err) => {
  console.error('❌ [MongoDB Cloud - Read Pool]: Lỗi kết nối tài khoản Read-Only:', err.message);
});

// 2. Connection Read-Write (Có quyền ghi/sửa/xóa)
const writeConn = mongoose.createConnection(process.env.MONGODB_WRITE_URI, {
  serverSelectionTimeoutMS: 5000,
});

writeConn.on('connected', () => {
  console.log('✅ [MongoDB Cloud - Write Pool]: Kết nối thành công bằng tài khoản Read-Write');
});

writeConn.on('error', (err) => {
  console.error('❌ [MongoDB Cloud - Write Pool]: Lỗi kết nối tài khoản Read-Write:', err.message);
});

module.exports = {
  readConn,
  writeConn,
};
