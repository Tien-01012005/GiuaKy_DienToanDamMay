const express = require('express');
const router = express.Router();
const { BookRead, BookWrite } = require('../models/Book');

// 3 số cuối MSSV làm tiền tố bắt buộc: '273'
const REQUIRED_PREFIX = '273';

// Chữ số cuối MSSV = 3 => VAT = (3 + 5)% = 8%
const MSSV_LAST_DIGIT = 3;
const VAT_RATE = MSSV_LAST_DIGIT + 5; // 8%

// 1. Tuyến đường ĐỌC: Lấy danh sách sách (Điều hướng vào Read-Only Pool)
router.get('/', async (req, res) => {
  try {
    // Điều hướng vào BookRead (Read Connection)
    const books = await BookRead.find().sort({ createdAt: -1 }).lean();

    // Lấy thông báo flash từ session (nếu có)
    const errorMessage = req.session ? req.session.errorMessage : null;
    const successMessage = req.session ? req.session.successMessage : null;

    if (req.session) {
      req.session.errorMessage = null;
      req.session.successMessage = null;
    }

    res.render('index', {
      books,
      vatRate: VAT_RATE,
      requiredPrefix: REQUIRED_PREFIX,
      errorMessage,
      successMessage,
      sessionData: req.session ? {
        id: req.sessionID,
        views: req.session.views || 1,
      } : null,
    });
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu qua Read Connection:', error);
    res.render('index', {
      books: [],
      vatRate: VAT_RATE,
      requiredPrefix: REQUIRED_PREFIX,
      errorMessage: `Lỗi kết nối Read Pool: ${error.message}`,
      sessionData: null,
    });
  }
});

// 2. Tuyến đường GHI: Thêm mới sách (Điều hướng vào Read-Write Pool)
router.post('/books', async (req, res) => {
  try {
    const { bookCode, title, author, price } = req.body;

    // THUẬT TOÁN BỘ LỌC DỮ LIỆU: Bắt buộc mã sản phẩm có tiền tố là 3 số cuối MSSV (273)
    const trimmedCode = (bookCode || '').trim();
    if (!trimmedCode.startsWith(REQUIRED_PREFIX)) {
      const err = `Từ chối xử lý! Mã sản phẩm "${trimmedCode}" không hợp lệ. Bắt buộc phải có tiền tố là 3 số cuối MSSV: "${REQUIRED_PREFIX}" (Ví dụ: ${REQUIRED_PREFIX}-01).`;
      if (req.session) {
        req.session.errorMessage = err;
      }
      return res.redirect('/');
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      if (req.session) {
        req.session.errorMessage = 'Giá gốc không hợp lệ!';
      }
      return res.redirect('/');
    }

    // THUẬT TOÁN TÍNH THUẾ ĐỘNG: VAT = (Chữ số cuối MSSV + 5)% = 8%
    const priceWithVAT = Math.round(numPrice * (1 + VAT_RATE / 100));

    // Điều hướng vào BookWrite (Write Connection)
    const newBook = new BookWrite({
      bookCode: trimmedCode,
      title: title.trim(),
      author: author.trim(),
      price: numPrice,
      vatRate: VAT_RATE,
      priceWithVAT,
    });

    await newBook.save();

    if (req.session) {
      req.session.successMessage = `Thêm sách "${title}" thành công qua tài khoản Read-Write! Giá sau thuế (+${VAT_RATE}% VAT): ${priceWithVAT.toLocaleString('vi-VN')} VNĐ`;
    }

    res.redirect('/');
  } catch (error) {
    console.error('Lỗi khi ghi dữ liệu qua Write Connection:', error);
    if (req.session) {
      req.session.errorMessage = `Lỗi ghi dữ liệu: ${error.message}`;
    }
    res.redirect('/');
  }
});

module.exports = router;
