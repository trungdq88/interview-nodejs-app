const EVENTS_PER_SECOND = 1000;

// Simulates a data source API endpoint or queue
class EventSource {
  static async fetchNextBatch() {
    const events = [];
    const eventTypes = ['login', 'click', 'navigation', 'api_call', 'logout'];
    const numEvents =
      Math.floor(Math.random() * EVENTS_PER_SECOND) + EVENTS_PER_SECOND / 2;

    for (let i = 0; i < numEvents; i++) {
      events.push({
        userId: Math.floor(Math.random() * 1000),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: new Date(),
        data: {
          path: '/some/random/path',
          metadata: {
            browser: 'Chrome',
            version: '120.0.0',
          },
        },
      });
    }

    // Simulate API response
    return JSON.stringify(events);
  }
}

module.exports = EventSource;
