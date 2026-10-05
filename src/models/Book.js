const mongoose = require('mongoose');
const { readConn, writeConn } = require('../config/db');

const bookSchema = new mongoose.Schema(
  {
    bookCode: {
      type: String,
      required: [true, 'Mã sách là bắt buộc'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Tên sách là bắt buộc'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Tác giả là bắt buộc'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá gốc là bắt buộc'],
      min: [0, 'Giá tiền không thể âm'],
    },
    vatRate: {
      type: Number,
      default: 8, // (Chữ số cuối MSSV 3 + 5)% = 8%
    },
    priceWithVAT: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo 2 Model tương ứng với 2 kết nối riêng biệt
// BookRead chỉ phục vụ truy vấn ĐỌC (sử dụng tài khoản Read-Only)
const BookRead = readConn.model('Book', bookSchema);

// BookWrite chỉ phục vụ truy vấn GHI (sử dụng tài khoản Read-Write)
const BookWrite = writeConn.model('Book', bookSchema);

module.exports = {
  BookRead,
  BookWrite,
};
