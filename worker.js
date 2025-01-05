// worker.js
// This worker processes user activity events and aggregates statistics
// It runs every 100ms to process incoming events from a queue

class UserActivityProcessor {
  constructor() {
    this.userSessions = new Map(); // Stores user session data
    this.processedEvents = 0;
  }

  // Simulates getting events from a queue
  getNextBatch() {
    // Simulate random user events
    const events = [];
    const eventTypes = ['login', 'click', 'navigation', 'api_call', 'logout'];
    const numEvents = Math.floor(Math.random() * 1_000_000) + 500_000;

    for (let i = 0; i < numEvents; i++) {
      events.push({
        userId: Math.floor(Math.random() * 100000).toString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: Date.now(),
        data: {
          path: '/some/random/path',
          metadata: {
            browser: 'Chrome',
            version: '120.0.0',
          },
        },
      });
    }

    return events;
  }

  processEvent(event) {
    if (!this.userSessions.has(event.userId)) {
      this.userSessions.set(event.userId, {
        lastActivity: event.timestamp,
        history: [],
      });
    }

    const session = this.userSessions.get(event.userId);

    // Update last activity
    session.lastActivity = event.timestamp;

    // Add to history
    session.history.push({
      type: event.type,
      timestamp: event.timestamp,
      path: event.data.path,
    });
  }

  cleanupOldSessions() {
    const now = Date.now();
    const SESSION_TIMEOUT = 3000;

    let cleanUpCount = 0;

    for (const [userId, session] of this.userSessions.entries()) {
      if (now - session.lastActivity > SESSION_TIMEOUT) {
        this.userSessions.delete(userId);
        cleanUpCount++;
      }
    }

    console.log(`Cleaned up ${cleanUpCount} old sessions`);
  }

  processBatch() {
    const events = this.getNextBatch();
    events.forEach((event) => this.processEvent(event));
    this.processedEvents += events.length;

    console.log(
      `Processed ${this.processedEvents} events. Active sessions: ${this.userSessions.size}`,
    );
  }
}

// Start the worker
const processor = new UserActivityProcessor();

setInterval(() => processor.processBatch(), 10);
setInterval(() => processor.cleanupOldSessions(), 3000);

setInterval(() => {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  console.log('Memory usage:', heapUsedMB, 'MB');
}, 5000);
