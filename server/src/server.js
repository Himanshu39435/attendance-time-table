require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const { adminEmail } = require('./utils/role');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '300kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', notFound);

if (process.env.SERVE_CLIENT === 'true') {
  const dist = path.join(__dirname, '../../client/dist');
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_EMAIL) console.warn('WARNING: ADMIN_EMAIL is not set. On an empty database, the first person to register becomes admin. Set ADMIN_EMAIL before going live.');
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is missing in server/.env'); process.exit(1); }
connectDB()
  .then(async () => { // the owner (ADMIN_EMAIL) is always an active admin
    if (adminEmail()) await User.updateMany({ email: adminEmail(), role: { $ne: 'admin' } }, { role: 'admin', isActive: true });
  })
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((e) => { console.error('Database connection failed:', e.message); process.exit(1); });
