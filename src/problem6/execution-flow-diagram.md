### 5.1 Score Update Broadcast Flow

```mermaid
sequenceDiagram
    participant User as User Client
    participant LB as Load Balancer
    participant API as API Server
    participant AuthSvc as Auth Service
    participant ScoreSvc as Score Service
    participant SSESvc as SSE Service
    participant Redis as Redis Cache
    participant DB as PostgreSQL
    participant Clients as Connected Clients

    User->>LB: POST /api/v1/scores/update
    Note over User,LB: {scoreIncrement: 100}

    LB->>API: Route to API server
    API->>AuthSvc: validateJWT(token)
    AuthSvc-->>API: {valid: true, userId: "user-123"}

    API->>ScoreSvc: updateUserScore(userId, increment)

    Note over ScoreSvc: Business Logic Layer
    ScoreSvc->>Redis: ZCARD rate_limit:score_update:user-123
    Redis-->>ScoreSvc: Current request count

    alt Rate Limit Exceeded
        ScoreSvc-->>API: {error: "Rate limit exceeded"}
        API-->>User: 429 Too Many Requests
    else Rate Limit OK
        ScoreSvc->>Redis: ZADD leaderboard:global newScore userId
        ScoreSvc->>Redis: ZREVRANGE leaderboard:global 0 9 WITHSCORES
        Redis-->>ScoreSvc: Updated top 10 list

        par Update Database (Async)
            ScoreSvc->>DB: UPDATE scores SET current_score = newScore
            ScoreSvc->>DB: INSERT INTO score_history (...)
        end

        ScoreSvc->>ScoreSvc: detectLeaderboardChanges(oldTop10, newTop10)

        alt Top 10 Rankings Changed
            ScoreSvc->>SSESvc: broadcastLeaderboardUpdate(event_data)
            Note over ScoreSvc,SSESvc: Event Data:<br/>{"type":"score_update",<br/>"leaderboard":[...],<br/>"timestamp":"..."}

            SSESvc->>SSESvc: getActiveConnections()
            SSESvc->>Clients: event: score_update
            Note over SSESvc,Clients: Broadcast to all connected clients

            SSESvc->>Redis: HINCRBY sse_stats events_sent 1
        end

        ScoreSvc-->>API: {success: true, newScore, newRank, inTopTen}
        API-->>User: 200 OK {newScore, newRank, inTopTen}
    end
```

### 5.2 Anti-Cheat Validation Flow

```mermaid
flowchart TD
    A[Score Update Request] --> B[Load Balancer]
    B --> C[API Server]

    C --> D[Auth Service:<br/>Validate JWT Token]
    D -->|Invalid| E[Return 401 Unauthorized]
    D -->|Valid| F[Extract User ID from Token]

    F --> G[Score Service:<br/>Rate Limit Check]
    G -->|Check Redis| H{ZCARD rate_limit:userId}
    H -->|Exceeded| I[Return 429 Rate Limited]
    H -->|OK| J[Score Service:<br/>Validate Score Increment]

    J -->|Invalid| K[Return 400 Bad Request]
    J -->|Valid| L[Score Service:<br/>Anomaly Detection]

    L -->|Suspicious Pattern| M[Log Anomaly Event<br/>+ Flag for Review]
    L -->|Normal Pattern| N[Proceed with Update]
    M --> O{Allow or Block?<br/>Based on severity}
    O -->|Block| P[Return 403 Suspicious Activity]
    O -->|Allow with Warning| N

    N --> Q[Score Service:<br/>Update Redis Leaderboard]
    Q --> R[Score Service:<br/>Update PostgreSQL]
    R --> S{Top 10 Rankings Changed?}

    S -->|Yes| T[SSE Service:<br/>Broadcast Update]
    T --> U[Return Success Response]
    S -->|No| U

    U --> V[API Server Response<br/>newScore, newRank]

```

**Anti-Cheat Rules:**

- **Rate Limiting**: Max 10 score updates per user per minute
- **Score Validation**: Only positive increments ≤ 1000 points per request
- **Anomaly Detection**: Flag users with >5000 points gained in 10 minutes
- **Pattern Analysis**: Detect regular intervals suggesting automation

### 5.3 SSE Connection Establishment Flow

```mermaid
sequenceDiagram
    participant Client as Web Client
    participant LB as Load Balancer
    participant API as API Server
    participant Auth as Auth Service
    participant SSE as SSE Service
    participant Redis as Redis Cache

    Note over Client,API: Initial SSE Connection Setup

    Client->>LB: GET /api/v1/leaderboard/stream
    Note over Client,LB: Headers:<br/>Accept: text/event-stream<br/>Cache-Control: no-cache<br/>Authorization: Bearer [token]

    LB->>API: Route to API server
    API->>Auth: validateToken(token)

    alt Valid Token
        Auth-->>API: userId, valid=true
        API->>SSE: createConnection(clientId, userId)
        SSE->>Redis: SADD sse_clients:active clientId
        SSE->>Redis: SETEX sse_client:clientId 300 metadata

        SSE-->>API: connection_id
        API->>Client: HTTP 200 OK
        Note over API,Client: Headers:<br/>Content-Type: text/event-stream<br/>Connection: keep-alive<br/>X-Accel-Buffering: no

        SSE->>Redis: ZREVRANGE leaderboard:global 0 9 WITHSCORES
        Redis-->>SSE: Current top 10 data

        SSE->>Client: event: leaderboard_full
        Note over SSE,Client: data: {"type":"leaderboard_full",<br/>"leaderboard":[...],<br/>"timestamp":"2025-08-17T10:30:00Z"}

        loop Every 30 seconds
            SSE->>Client: event: heartbeat
            Note over SSE,Client: data: {"type":"heartbeat",<br/>"timestamp":"...",<br/>"connectedClients":847}

            alt Client not responding
                SSE->>Redis: SREM sse_clients:active clientId
                SSE->>Redis: DEL sse_client:clientId
            end
        end

    else Invalid Token
        Auth-->>API: valid=false
        API->>Client: HTTP 401 Unauthorized
    end

    Note over Client,Redis: Connection stays active for real-time updates
```
