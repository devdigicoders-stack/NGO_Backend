// ─────────────────────────────────────────────────────────────
// server.js  —  Server entry point
//
// Connects to MongoDB first, then starts listening.
// ─────────────────────────────────────────────────────────────
const app                 = require('./app');
const { PORT, NODE_ENV }  = require('./config');
const { connectDB }       = require('./config/db');

// Connect to MongoDB, then start the server
(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log(`║   NGO Backend API  —  ${NODE_ENV.toUpperCase().padEnd(21)}║`);
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  🚀  Server  →  http://localhost:${PORT}        ║`);
    console.log(`║  📋  Health  →  /api/health                  ║`);
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║  Programs (हमारे कार्यक्रम)                    ║');
    console.log('║  GET    /api/programs                        ║');
    console.log('║  POST   /api/programs                        ║');
    console.log('║  GET    /api/programs/:id                    ║');
    console.log('║  PUT    /api/programs/:id                    ║');
    console.log('║  PATCH  /api/programs/:id/toggle             ║');
    console.log('║  DELETE /api/programs/:id                    ║');
    console.log('║  PATCH  /api/programs/reorder                ║');
    console.log('╚══════════════════════════════════════════════╝\n');
  });
})();
