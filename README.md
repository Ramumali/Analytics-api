📊 Website Analytics API

A production-ready event tracking & analytics backend supporting:

Event collection

Event summary analytics

User analytics

API key authentication

Redis caching

PostgreSQL storage

Dockerized deployment

Swagger API documentation

🚀 Features
📥 Event Tracking

Track any frontend/user events such as:
login_click, cta_click, page_view, etc.

📊 Analytics

Total events

Unique users

Device aggregation

User-level analytics

🔑 API Key Protection

Each app gets its own API key.
Requests must include:

x-api-key: YOUR_KEY

⚡ Redis Caching

Event summary results cached for 3 minutes.

🐘 PostgreSQL + Prisma

All event data stored using Prisma ORM.

🐳 Full Docker Setup

Includes:

Node app

PostgreSQL

Redis

🛠️ Installation (Local Development)
1️⃣ Install dependencies
npm install

2️⃣ Setup PostgreSQL & Redis using Docker
docker-compose up -d

3️⃣ Run Prisma migrations
npx prisma migrate dev

4️⃣ Start the server
npm run dev


Server runs at:

👉 http://localhost:4000

🐳 Running Everything in Docker
docker-compose up --build


This starts:

app (Node API)

postgres

redis

### API Documentation

Swagger docs available at:

👉 http://localhost:4000/api-docs

🔑 Authentication (API Key)

Every request must include:

x-api-key: YOUR_API_KEY


You can generate a new key using:

POST /api/auth/register


Body:

{
  "name": "My App"
}

### Event Collection
Endpoint
POST /api/analytics/collect

Example Body
{
  "event": "login_click",
  "url": "https://example.com",
  "referrer": "https://google.com",
  "device": "mobile",
  "ipAddress": "192.168.1.1",
  "metadata": { "browser": "Chrome" },
  "timestamp": "2025-01-02T12:00:00Z"
}

### Event Summary API
Endpoint
GET /api/analytics/event-summary?event=login_click

Example:
curl -G http://localhost:4000/api/analytics/event-summary \
  -H "x-api-key: YOUR_KEY" \
  --data-urlencode "event=login_click"


Response:

{
  "event": "login_click",
  "count": 20,
  "uniqueUsers": 5,
  "deviceData": {
    "mobile": 12,
    "desktop": 8
  }
}

### User Analytics
Endpoint
GET /api/analytics/user-stats?userId=abc123


Response:

{
  "userId": "abc123",
  "totalEvents": 42,
  "deviceDetails": { "browser": "Chrome", "os": "Windows" },
  "ipAddress": "192.168.1.2",
  "recentEvent": {
    "event": "login_click",
    "url": "/home",
    "timestamp": "2025-01-02T13:00:00Z"
  }
}

### Environment Variables

Create a .env file:

DATABASE_URL="postgresql://postgres:password@localhost:5432/analytics"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET="your-secret"

Running Tests (if added)
npm test