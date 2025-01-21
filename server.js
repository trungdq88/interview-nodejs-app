const express = require('express');
const app = express();
const EventSource = require('./data-source');

const PORT = process.env.PORT || 9769;
const SESSION_TIMEOUT = 3000;

class UserActivityProcessor {
  constructor() {
    this.userSessions = new Map();
    this.processedEvents = 0;
  }

  processEvent(event) {
    if (!this.userSessions.has(event.userId)) {
      this.userSessions.set(event.userId, {
        lastActivity: event.timestamp,
        history: [],
      });
    }

    const session = this.userSessions.get(event.userId);
    session.lastActivity = event.timestamp;

    session.history.push({
      type: event.type,
      timestamp: event.timestamp,
      path: event.data.path,
    });
  }

  expireSessions() {
    const now = Date.now();

    for (const [userId, session] of this.userSessions.entries()) {
      if (now - session.lastActivity > SESSION_TIMEOUT) {
        this.userSessions.delete(userId);
      }
    }
  }

  async fetchAndProcessBatch() {
    try {
      const jsonBatch = await EventSource.fetchNextBatch();
      const events = JSON.parse(jsonBatch);

      events.forEach((event) => this.processEvent(event));
      this.processedEvents += events.length;

      this.expireSessions();

      console.log(
        `Processed ${this.processedEvents} events. Active sessions: ${this.userSessions.size}`,
      );
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }
}

// Start the worker
const processor = new UserActivityProcessor();

// Process events every 500ms
setInterval(() => processor.fetchAndProcessBatch(), 500);

// Set up Express routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/events', (req, res) => {
  res.json({ processedEvents: processor.processedEvents });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
