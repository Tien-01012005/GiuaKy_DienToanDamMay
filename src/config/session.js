const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo.MongoStore || connectMongo;

/**
 * Cấu hình Stateless Session lưu trữ tập trung trực tiếp trên MongoDB Atlas Cloud
 * Giúp ứng dụng đáp ứng tiêu chuẩn Stateless, sẵn sàng cho việc Auto-scaling đa node/PaaS
 * mà người dùng không bị mất phiên làm việc (Session Persistence)
 */
function configureSession(app) {
  // Tạo MongoStore lưu trữ session vào MongoDB Atlas
  const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_WRITE_URI,
    collectionName: 'sessions', // Lưu trong collection 'sessions' trên DB_23IT273
    ttl: 14 * 24 * 60 * 60, // Hạn session: 14 ngày (giây)
    autoRemove: 'native',
    touchAfter: 24 * 3600, // Cập nhật session sau mỗi 24h nếu không có thay đổi
    mongoOptions: {
      serverSelectionTimeoutMS: 5000,
    },
  });

  sessionStore.on('create', (sessionId) => {
    console.log(`[Stateless Session]: Khởi tạo session mới trên MongoDB Atlas: ${sessionId}`);
  });

  sessionStore.on('error', (err) => {
    console.error('❌ [Session Store Error]:', err.message);
  });

  // Cấu hình Express Session sử dụng store MongoDB Atlas
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secret_giuaky_23it273_cloud',
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 giờ
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Kích hoạt bảo mật cookie trên môi trường HTTPS của PaaS
        sameSite: 'lax',
      },
    })
  );

  // Middleware theo dõi số lần truy cập trong phiên làm việc
  app.use((req, res, next) => {
    if (req.session) {
      req.session.views = (req.session.views || 0) + 1;
    }
    next();
  });

  console.log('✅ [Stateless Session]: Đã kích hoạt lưu trữ Session trên Cloud MongoDB Atlas');
}

module.exports = configureSession;
