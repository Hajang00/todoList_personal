require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

// 미들웨어 설정 (프론트 개발 서버에서의 요청 허용)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json()); // JSON 데이터를 파싱하기 위해 꼭 필요합니다.
app.use('/static', express.static(path.join(__dirname, 'public')));

// DB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected...'))
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
  });

// 라우터 설정
app.use('/tasks', require('./routes/read'));
app.use('/tasks', require('./routes/create'));
app.use('/tasks', require('./routes/modify'));
app.use('/tasks', require('./routes/delete'));

app.get('/', (req, res) => res.send('Task API Server is Running!'));

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));