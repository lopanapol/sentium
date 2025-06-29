
let redis;
console.log('⚠️ Using file-based storage for local development');
redis = {
  exists: async () => false,
  hmset: async () => true,
  hgetall: async () => ({}),
  hset: async () => true,
  hget: async () => null
};

async function initializePixelState() {
  const exists = await redis.exists('pixel:state');
  if (!exists) {
    await redis.hmset('pixel:state', {
      connected: 'false',
      lastConnected: new Date().toISOString(),
      color: 'rgb(255, 0, 102)',
      excitementLevel: '0',
      x: '50',
      y: '50'
    });
    console.log('Initialized default pixel state in Redis');
  }
}

module.exports = {
  redis,
  initializePixelState
};
