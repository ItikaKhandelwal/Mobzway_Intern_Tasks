require('./utils/loadEnv')();

// const dns = require('dns');
const cors = require('cors');
const path = require('path');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const User = require('./models/User');
const userRoutes = require('./routes/users');

// // Force Node's internal DNS resolver to use Google DNS.
// // Node uses its own resolver (separate from Windows'), which sometimes
// // fails to resolve MongoDB Atlas SRV records on certain ISPs/routers
// // (common on Jio/Reliance networks in India) even when `nslookup` works fine.
// dns.setServers(['8.8.8.8', '8.8.4.4']);

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const LIVE_USERS_ROOM = 'live_users';

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Copy .env.example to .env and add your MongoDB connection string.');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Unexpected server error. Please try again.'
  });
});

// Assignment 2 requires these values to be maintained in a local variable.
// Map key: socket ID. Map value: user ID, email, name, and socket ID.
const liveUsers = new Map();

function getLiveUsers() {
  return Array.from(liveUsers.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function broadcastLiveUsers() {
  io.to(LIVE_USERS_ROOM).emit('live-users-updated', getLiveUsers());
}

io.on('connection', (socket) => {
  // Observers can enter the Socket.IO room and see the list without being
  // counted as an inserted user.
  socket.on('watch-live-users', (acknowledge) => {
    socket.join(LIVE_USERS_ROOM);
    if (typeof acknowledge === 'function') {
      acknowledge({ success: true, users: getLiveUsers() });
    }
  });

  socket.on('join-live-users', async (payload = {}, acknowledge) => {
    try {
      const userId = payload.userId;
      if (!mongoose.isValidObjectId(userId)) {
        throw new Error('Invalid user ID.');
      }

      const user = await User.findById(userId).lean();
      if (!user) {
        throw new Error('User not found.');
      }

      socket.join(LIVE_USERS_ROOM);
      liveUsers.set(socket.id, {
        userId: String(user._id),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        socketId: socket.id
      });

      broadcastLiveUsers();
      if (typeof acknowledge === 'function') {
        acknowledge({ success: true, users: getLiveUsers() });
      }
    } catch (error) {
      if (typeof acknowledge === 'function') {
        acknowledge({ success: false, message: error.message });
      }
    }
  });

  socket.on('disconnect', () => {
    if (liveUsers.delete(socket.id)) {
      broadcastLiveUsers();
    }
  });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to MongoDB.');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n${signal} received. Closing server...`);
  await mongoose.connection.close();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
