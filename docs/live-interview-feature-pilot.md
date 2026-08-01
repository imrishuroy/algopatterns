# About

This document describes the design of the live peer interview feature for AlgoPatterns. It covers the motivation, architecture, real-time protocol, data model, and implementation considerations for hosting structured coding interviews between two users in real time. This is a living document and may be updated as the implementation evolves.

# Overview

AlgoPatterns is an educational platform for learning algorithm patterns through code templates, insights, tutorials, and quizzes. The primary design goals for the live interview feature are **realistic interview practice**, **collaborative learning**, and **session persistence**. Two users should be able to run a complete mock interview online: the interviewer picks a problem, the interviewee solves it in a shared editor with live code execution, and both leave with a recorded, reviewable session.

Interview practice is one of the most requested features on coding platforms, but real mock interviews are hard to arrange. The live interview feature removes that friction by pairing two peers directly on the platform: one plays interviewer, the other plays interviewee. The session runs in a purpose-built room that combines the pieces AlgoPatterns already has, a Monaco editor, Judge0 code execution, and the problem bank, behind a real-time collaboration layer.

A session works like this: the interviewer creates a session and receives a 6-character join code and an invite link. The interviewee joins with the code. Once both are present, the interview starts with a 45-minute timer. The interviewer selects a problem from the platform's problem bank (or changes it mid-session). The interviewee writes code in the shared Monaco editor. Either participant can hit Run, which executes against the sample test cases through the existing Judge0 pipeline, with results broadcast to both screens. A chat panel handles communication, and the interviewer can take private notes, toggle who can edit the editor, and end the session early. When the session ends, the interviewer leaves a rating and feedback, and both participants get access to the full replay: chat history, code snapshots, run history, and the feedback report.

AlgoPatterns achieves realistic interview practice:

- Structured session lifecycle with explicit phases (waiting, in progress, feedback)
- A real problem from the platform's curated problem bank, including difficulty and pattern context
- A visible 45-minute timer that creates interview-like time pressure
- Live code execution with the same Judge0 sandbox used by the platform's own problem page

AlgoPatterns achieves collaborative learning:

- Shared code editor with live sync between both peers
- Built-in chat panel for discussion without leaving the room
- Interviewer controls (edit lock, private notes, feedback) that mirror a real interviewer's workflow
- Post-session replay so the interviewee can review exactly what they wrote and when

AlgoPatterns achieves session persistence:

- Every session, message, code snapshot, and run is stored
- Sessions are resumable after network drops via snapshot state
- Both participants can revisit past sessions and read feedback

# Architecture

The system adds a real-time layer on top of the existing AlgoPatterns stack. The Next.js frontend opens a WebSocket connection to a new Go hub component; the Go backend continues to handle REST calls for session CRUD and code execution exactly as it does today. CockroachDB stores session data, messages, and code snapshots, while the existing submission pipeline (Judge0) is reused unchanged for running code.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                               │
│                                                                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────────────┐  │
│  │ Interview Lobby │───▶│  InterviewRoom  │───▶│ useInterviewSocket    │  │
│  │ Create/Join     │    │  (Room layout)  │    │ (WS client + reconnect)│ │
│  └─────────────────┘    └────────┬────────┘    └───────────┬────────────┘  │
│                                  │                        │                │
│                     ┌────────────┼────────────┐           │                │
│                     ▼            ▼            ▼           │                │
│              ┌───────────┐ ┌───────────┐ ┌─────────┐      │                │
│              │ Monaco    │ │ ChatPanel │ │ RunPanel│      │                │
│              │ Editor    │ │ (messages)│ │ (Judge0 │      │                │
│              │ (shared)  │ └───────────┘ │  output)│      │                │
│              └───────────┘               └─────────┘      │                │
│                     │                          │          │                │
└─────────────────────┼──────────────────────────┼──────────┼──────────────┘
                      │ REST (HTTP/HTTPS)        │ REST     │ WebSocket (WSS)
                      ▼                          ▼          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         Backend (Go + Gin)                                 │
│                                                                            │
│  ┌──────────────────────┐      ┌────────────────────────────────────────┐ │
│  │ Interview Handler    │      │ Interview Hub (new)                    │ │
│  │ (REST: CRUD, state)  │─────▶│  • Client registry by session          │ │
│  └──────────────────────┘      │  • Message relay (broadcast to room)   │ │
│  ┌──────────────────────┐      │  • Presence tracking                   │ │
│  │ Submission Handler   │      │  • Run result fan-out                  │ │
│  │ (existing, extended) │      └────────────────────────────────────────┘ │
│  └──────────────────────┘                │                                │
│  ┌──────────────────────┐      ┌─────────▼─────────┐      ┌──────────────┐│
│  │ Auth Middleware      │      │ Interview Service │      │ Submission   ││
│  │ (JWT, optional)      │      │ (state machine)   │─────▶│ Service      ││
│  └──────────────────────┘      └───────────────────┘      │ (existing)   ││
│                                                            │              ││
└────────────────────────────────────────────────────────────┼──────────────┘
                                                             │
                                        Judge0 batch submission (existing)
                                                             ▼
                                        ┌──────────────────────────────────┐
                                        │         Judge0 (Docker)          │
                                        │  • Isolate sandbox               │
                                        │  • Language runtimes             │
                                        └──────────────────────────────────┘
                                                             │
┌────────────────────────────────────────────────────────────┼──────────────┐
│                         CockroachDB                         ▼              │
│  • users (existing)        • interview_sessions           submissions     │
│  • problems (existing)     • interview_participants       (existing,      │
│  • submissions (existing)  • interview_messages           +session FK)    │
│                            • interview_code_snapshots                     │
└───────────────────────────────────────────────────────────────────────────┘
```

The two new backend pieces are the **Interview Handler** (REST) and the **Interview Hub** (WebSocket). The handler owns session lifecycle and reads/writes session state. The hub owns live connections and relays messages between the two participants. They share the **Interview Service**, which implements the session state machine and persistence, following the handler-service-repository pattern used across the codebase.

The existing Submission Service is reused for code execution. The only change is optional: when a submission originates from an interview session, the submission record is linked to the session ID so run history can be replayed later. Judge0 itself, and the Judge Service wrapping it, are untouched.

# Session Lifecycle

A session moves through four states, enforced by the backend:

```
┌────────────┐   create   ┌──────────────┐   both present   ┌───────────────┐
│   waiting  │───────────▶│   waiting    │─────────────────▶│  in_progress  │
│ (created)  │  join code │  (ready to   │   start session  │   (timer)     │
│            │   shared   │   start)     │                  │               │
└────────────┘            └──────────────┘                  └───────┬───────┘
                                                                     │
                                                              end / abort
                                                                     ▼
                                                           ┌────────────────┐
                                                           │  feedback      │
                                                           │  (rating,      │
                                                           │   notes)       │
                                                           └────────────────┘
```

**1. Create.** The interviewer (authenticated) creates a session. The backend generates a unique 6-character join code (from a 30-character unambiguous alphabet, e.g. no 0/O/1/I) and returns it with the invite URL. The session is in `waiting` state. No problem is attached yet.

**2. Join.** The interviewee enters the join code (or opens the invite link) and authenticates. The backend validates the code, checks the session is `waiting` or `in_progress` (rejoin allowed), and adds the user as a participant with role `interviewee`. If the session already has two participants and the joining user is not one of them, the join is rejected with `SESSION_FULL`.

**3. Start.** Either participant can press Start once both are present, but only the interviewer may choose the problem first. Starting transitions the session to `in_progress`, records `started_at`, and the 45-minute timer begins. Both clients receive a `session.state` broadcast.

**4. End.** The interviewer can end the session at any time; ending also happens automatically when the timer hits zero. The state moves to `feedback`. The interviewer is prompted for a rating (1 to 5) and optional written notes. Once submitted, the session reaches `completed`, and both participants can view the replay.

An `aborted` state covers a session where the interviewee never joined and the interviewer explicitly cancels within the waiting state, or where both users disconnect and the session is idle past a grace period.

# Roles and Permissions

Each session has exactly two participants with distinct roles. Roles are assigned at join time and cannot change mid-session.

| Capability | Interviewer | Interviewee |
|------------|-------------|-------------|
| Create session / generate join code | Yes | No |
| Join via code | No (only interviewee slot) | Yes |
| Select / change problem | Yes | No |
| Start session | Yes | Yes |
| End session early | Yes | No |
| Edit shared code | Yes (default) | Yes |
| Lock interviewee editing | Yes (toggle) | No |
| Run code | Yes | Yes |
| Send chat messages | Yes | Yes |
| View private notes | Yes | No |
| Submit rating and feedback | Yes | No |
| View replay after completion | Yes | Yes |

**Edit lock.** The interviewer can toggle an `interviewee_locked` flag. When locked, code edits from the interviewee's client are rejected by the hub (not just hidden in the UI), while the interviewer can keep editing. This is useful for demonstrating fixes after the interview ends or while giving feedback. The lock is broadcast as a `session.state` message.

**Private notes.** Notes typed by the interviewer are stored on the session record and never broadcast to the interviewee during the session. They appear in the interviewer's own replay view and, at the interviewer's discretion, are included in the post-session feedback report.

# Real-Time Protocol

The backend has no WebSocket dependency today, so the first step is to add `github.com/gorilla/websocket` (the same library used by most Go projects and compatible with Gin via `gin.Context.Writer`/`Request` hijacking). All live traffic for an interview flows over a single WebSocket connection per participant.

## Connection and Authentication

The browser cannot set `Authorization` headers on a WebSocket upgrade, so the JWT is passed as a query parameter on the upgrade URL:

```
GET /api/v1/interviews/ws?session_id=...&token=...
```

The hub validates the token (using the existing JWT secret) and the session membership before accepting the upgrade. Because query parameters can end up in access logs, the design uses a short-lived one-time WS token instead of the long-lived access token, issued by `POST /api/v1/interviews/{id}/ws-token` and valid for 60 seconds. The chat/run/code messages carried over the connection are otherwise authorized by the established session membership.

## Message Envelope

All messages share a single envelope with a message type and payload. The server broadcasts every non-acknowledgement message to the other participant (and echoes control messages to both).

```json
{
  "id": "msg-uuid",
  "type": "code.change",
  "payload": { ... },
  "sent_at": "2026-08-01T10:00:00Z"
}
```

## Message Types

| Type | Direction | Payload | Purpose |
|------|-----------|---------|---------|
| `session.state` | server to both | `{ status, problem_slug, language_slug, time_remaining_seconds, interviewee_locked }` | Room state after any change; also the initial snapshot on join/reconnect |
| `code.change` | client to server, relayed | `{ version, content }` | Full editor content with Lamport version stamp |
| `cursor.move` | client to server, relayed | `{ line, column, role }` | Remote cursor position for the other participant |
| `chat.message` | client to server, relayed | `{ sender_id, sender_name, text, sent_at }` | Chat line, persisted by the hub |
| `chat.typing` | client to server, relayed | `{ sender_id }` | Typing indicator, ephemeral, never persisted |
| `run.submit` | client to server | `{ language_slug, code, test_case_ids? }` | Request to execute code through Judge0 |
| `run.result` | server to both | `{ run_id, verdict, per_case, stdout, stderr, time_ms, memory_kb }` | Execution result broadcast |
| `presence.join` / `presence.leave` | server to both | `{ user_id, user_name, role }` | Participant connected/disconnected |
| `feedback.submitted` | server to both | `{ rating, has_notes }` | Interviewer submitted feedback |

The full message set is defined in a shared schema that the frontend mirrors as a discriminated TypeScript union:

```typescript
type InterviewMessage =
  | { type: "session.state"; payload: SessionState }
  | { type: "code.change"; payload: { version: number; content: string } }
  | { type: "cursor.move"; payload: { line: number; column: number } }
  | { type: "chat.message"; payload: ChatLine }
  | { type: "run.result"; payload: RunResult }
  | { type: "presence.join"; payload: Participant }
  | { type: "presence.leave"; payload: { user_id: string } };
```

## Message Handling Rules

- Chat messages are capped at 2000 characters; code messages at 300 KB. Larger payloads are rejected with a `MSG_TOO_LARGE` error frame.
- The hub rate-limits each connection to 30 messages per second; excess messages are dropped and counted in metrics.
- All relayed messages carry the sender's role so the receiver can render "interviewer" vs "interviewee" styling.
- Messages that fail to validate are answered with an `error` frame containing a code and message; they are never persisted.

## Hub Design

The hub follows the classic gorilla/websocket hub pattern with a small twist: rooms are keyed by session ID and each room holds at most two registered clients.

```go
type Hub struct {
    mu     sync.RWMutex
    rooms  map[string]*Room   // session_id -> room
}

type Room struct {
    id        string
    mu        sync.Mutex
    clients   map[*Client]struct{}
    broadcast chan []byte
}

type Client struct {
    hub       *Hub
    conn      *websocket.Conn
    send      chan []byte
    sessionID string
    userID    string
    role      string
}
```

Each connection runs a reader goroutine (parses envelopes, dispatches to service methods) and a writer goroutine (drains the `send` channel with a per-message write deadline). The room's `broadcast` channel fan-out is capped, and clients that fall behind (send buffer full) are disconnected and rejoin via snapshot, which keeps slow peers from blocking the room.

Stateful actions (code changes, chat, state transitions, runs) go through the Interview Service so persistence and broadcast happen in the same place, preventing the divergence you get when a message is persisted but never broadcast or vice versa.

# Code Editor Synchronization

The editor is a shared Monaco instance (the frontend already depends on `@monaco-editor/react`). Both participants see the same document, and for a two-person room a simple last-writer-wins protocol is sufficient; CRDT-based sync is deferred to a future iteration.

## Sync Protocol

Every editor change (debounced to 150 ms in the browser) produces a `code.change` message carrying the full document content plus a Lamport version stamp:

- Each client keeps a local `version` counter.
- When a client makes an edit, it sends `{ version: localVersion + 1, content }` and sets its local version to the sent value.
- When a client receives a remote `code.change`, it applies the content only if `remoteVersion >= localVersion` (replacing its local version counter with the remote one). Otherwise the message is stale and ignored.
- After applying, the client resets Monaco's undo stack with `model.pushEditOperations` on an equivalent-content set so stale undo entries cannot clobber remote changes.

This gives the standard last-writer-wins behavior: typing conflicts resolve to the most recent write, and because only two peers are involved, version divergence is a non-issue in practice.

```typescript
// frontend hook sketch
const applyRemoteChange = (version: number, content: string) => {
  if (version < localVersion.current) return; // stale
  localVersion.current = version;
  editorRef.current?.pushUndoStop();
  editorRef.current?.executeEdits("remote", [
    {
      range: model.getFullModelRange(),
      text: content,
      forceMoveMarkers: true,
    },
  ]);
  editorRef.current?.pushUndoStop();
};
```

Monaco's `onDidChangeModelContent` fires on programmatic edits too, so the client uses a `suppressBroadcast` flag to avoid echoing remote changes back to the sender.

## Remote Cursor

`cursor.move` messages are sent at most every 200 ms (throttled) and render a colored caret with the participant's name tag in the other participant's editor via Monaco decorations. Cursor positions are applied optimistically and never persisted.

## Reconciliation on Reconnect

Reconnects happen often on flaky networks, and the code must never fork. On reconnection:

1. The client opens a new WebSocket and receives the current `session.state`.
2. The client fetches the authoritative code via `GET /api/v1/interviews/{id}/code`, which returns the latest snapshot from the database plus the current version number.
3. The editor loads that content with `localVersion = serverVersion`, and any messages missed while offline are replayed from `interview_code_snapshots` (for code) and `interview_messages` (for chat), fetched through REST.
4. If the interviewer was mid-edit during the gap, the reconnecting client's fetch may race a live edit; the Lamport check in `applyRemoteChange` resolves the conflict in favor of the later version.

## Snapshot Policy

Snapshots serve two purposes: recovery and replay. The hub asks the service to persist a snapshot:

- every 30 seconds while the editor content changed since the last snapshot,
- on every code execution (the exact code that ran is preserved),
- on session end.

This bounds snapshot volume to at most a few thousand rows per hour-long session while guaranteeing the replay can reconstruct the timeline at 30-second granularity. `interview_code_snapshots` is also the source for the replay scrubber in the post-session view.

# Code Execution Integration

Running code in an interview reuses the existing Judge0 pipeline end to end. There is no new execution path.

When either participant clicks Run:

1. The frontend sends `run.submit` over the WebSocket (or, on a degraded connection, falls back to `POST /api/v1/submissions/run`).
2. The Interview Service forwards the request to the existing Submission Service with the session ID attached.
3. The Submission Service wraps the code, batches sample test cases to Judge0, and waits for results exactly as the problem page does today.
4. The result is persisted (with `interview_session_id` on the submission row) and broadcast to both clients as `run.result`.

The broadcast payload mirrors the existing run result shape:

```json
{
  "run_id": "uuid",
  "verdict": "accepted",
  "per_case": [
    { "case_id": "c1", "passed": true, "stdout": "3", "time_ms": 42 }
  ],
  "stdout": "3",
  "stderr": "",
  "time_ms": 42,
  "memory_kb": 9216,
  "error_type": ""
}
```

Judge0 resource limits are unchanged (5 s CPU, 128 MB memory). A misbehaving solution in an interview is no different from a misbehaving solution on the problem page, so reusing the limits keeps behavior consistent and avoids a second set of security-relevant configuration.

Only sample test cases run in an interview session. Hidden test cases stay hidden because the interviewer may want to use a full problem, but the session UI shows only the sample cases in the run panel. `test_case_ids` in `run.submit` lets a future version run a subset of cases; today the field is optional and ignored.

# Chat and Collaboration

The chat panel is the second real-time surface in the room.

- Messages are persisted by the hub through the Interview Service and included in the replay.
- `chat.typing` is ephemeral: it shows a "typing" indicator for at most 3 seconds and is never stored.
- Chat lines render with the sender's role badge and a timestamp.
- The interviewer's private notes are a separate surface, intentionally not part of chat. Notes are stored on the session and only visible to the interviewer until feedback submission.

# Timer and Session Controls

The timer is server-authoritative. `started_at` is recorded when the session enters `in_progress`, and `time_remaining_seconds` is computed by the server as `45 * 60 - (now - started_at)`, clamped at zero. Clients never compute the countdown from their own clocks, so a reconnecting client immediately sees the correct remaining time and there is no drift between the two screens.

When the timer reaches zero, the hub pushes `session.state` with `status: "feedback"` and the frontend moves to the end-of-interview screen. The interviewer can also end early. A session that sits in `in_progress` with no participant connected for more than 15 minutes is aborted by a background janitor job.

# Data Model

The interview feature adds four tables. The existing `submissions` table gains one nullable foreign key column.

```sql
-- Interview sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    join_code VARCHAR(6) NOT NULL UNIQUE,

    -- Participants (role-bearing, resolved via interview_participants)
    host_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session configuration
    status VARCHAR(20) NOT NULL DEFAULT 'waiting'
        CHECK (status IN ('waiting', 'in_progress', 'feedback', 'completed', 'aborted')),
    problem_slug VARCHAR(100),               -- Selected by interviewer, null until start
    language_slug VARCHAR(20) NOT NULL DEFAULT 'python',
    duration_minutes INT NOT NULL DEFAULT 45,
    interviewee_locked BOOLEAN NOT NULL DEFAULT false,

    -- Interviewer private state
    private_notes TEXT,

    -- Feedback (interviewer submits during feedback state)
    feedback_rating INT
        CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_notes TEXT,

    -- Timing
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookups by join code and listing a user's sessions
CREATE INDEX idx_interview_sessions_join_code ON interview_sessions(join_code);
CREATE INDEX idx_interview_sessions_host ON interview_sessions(host_user_id, created_at DESC);

-- Participants (exactly two per session: interviewer + interviewee)
CREATE TABLE IF NOT EXISTS interview_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('interviewer', 'interviewee')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,

    UNIQUE(session_id, user_id),
    UNIQUE(session_id, role)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS interview_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL,
    text TEXT NOT NULL CHECK (char_length(text) <= 2000),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_messages_session
    ON interview_messages(session_id, sent_at);

-- Code snapshots (recovery + replay)
CREATE TABLE IF NOT EXISTS interview_code_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    version INT NOT NULL,
    content TEXT NOT NULL,
    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(20) NOT NULL
        CHECK (reason IN ('interval', 'run', 'session_end', 'reconnect')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(session_id, version)
);

CREATE INDEX idx_interview_snapshots_session
    ON interview_code_snapshots(session_id, created_at);

-- Existing submissions table gains an optional session link (migration only)
ALTER TABLE submissions
    ADD COLUMN IF NOT EXISTS interview_session_id UUID
        REFERENCES interview_sessions(id) ON DELETE SET NULL;

CREATE INDEX idx_submissions_interview
    ON submissions(interview_session_id, created_at);
```

**Design decisions:**

1. **Separate participants table with a `UNIQUE(session_id, role)` constraint**: guarantees the interviewer/interviewee slots are exclusive at the database level, even if the join endpoint races.
2. **Join code uniqueness with a 6-character unambiguous alphabet**: ~30^6 combinations, collision-free in practice; a retry loop regenerates on the rare conflict.
3. **Snapshots store full content, not diffs**: with two participants and a 30-second interval, full content is simpler and cheaper than diff reconstruction, and it makes replay trivially correct. Diff-based storage is a future optimization.
4. **`submissions.interview_session_id` nullable with `SET NULL`**: keeps the submission pipeline untouched for non-interview usage and preserves submission rows if a session is ever deleted.
5. **No denormalized participant columns on the session**: the join-code flow needs `host_user_id` for authorization, but the role-bearing participant rows belong in their own table so a user can appear in multiple sessions and so participant history (join/leave times) is retained.
6. **`private_notes` on the session row**: they are interviewer-only, single-value state; a separate table would be overkill until notes become multi-versioned or shared.
7. **Status check constraints mirror the existing quiz/attempt tables**: consistent with the codebase's style of enforcing state machines in SQL.

# API Design

The REST surface manages session lifecycle and replay; everything live goes over the WebSocket. All endpoints except join require authentication.

**Create Session**

```
POST /api/v1/interviews
Authorization: Bearer <token>

{
  "duration_minutes": 45,
  "language_slug": "python"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-session-1",
    "join_code": "K7QX2P",
    "invite_url": "https://algopatterns.com/interview/join/K7QX2P",
    "status": "waiting",
    "created_at": "2026-08-01T10:00:00Z"
  }
}
```

**Join Session**

```
POST /api/v1/interviews/join
Authorization: Bearer <token>

{
  "join_code": "K7QX2P"
}
```

Fails with `SESSION_NOT_FOUND`, `SESSION_ALREADY_STARTED` (if in `feedback`/`completed`), or `SESSION_FULL`.

Response:
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-session-1",
    "role": "interviewee",
    "status": "waiting",
    "problem_slug": null
  }
}
```

**Get Session State**

```
GET /api/v1/interviews/{session_id}
Authorization: Bearer <token>
```

Returns the full session record (excluding `private_notes` for the interviewee), participant list, and current code snapshot. Used by the room on load and by the lobby to poll status.

**Update Session**

```
PATCH /api/v1/interviews/{session_id}
Authorization: Bearer <token> (interviewer only)
```

Body accepts any of `problem_slug`, `language_slug`, `status` (start/end transitions), `interviewee_locked`, `private_notes`. The hub broadcasts a `session.state` after a successful update.

**Submit Feedback**

```
POST /api/v1/interviews/{session_id}/feedback
Authorization: Bearer <token> (interviewer only)

{
  "rating": 4,
  "notes": "Strong on edge cases, spent too long on brute force."
}
```

Moves the session to `completed` and broadcasts `feedback.submitted`.

**Get Code State**

```
GET /api/v1/interviews/{session_id}/code
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "version": 128,
    "content": "def two_sum(nums, target): ...",
    "language_slug": "python"
  }
}
```

**Get Session Replay**

```
GET /api/v1/interviews/{session_id}/replay
Authorization: Bearer <token> (both participants)
```

Response:
```json
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "code_snapshots": [ ... ],
    "runs": [
      {
        "run_id": "uuid",
        "verdict": "accepted",
        "time_ms": 42,
        "created_at": "2026-08-01T10:24:00Z"
      }
    ],
    "feedback": { "rating": 4, "notes": "..." },
    "timeline": [ ... ]
  }
}
```

**Issue One-Time WS Token**

```
POST /api/v1/interviews/{session_id}/ws-token
Authorization: Bearer <token> (participant only)
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "ws-jwt-...",
    "expires_in": 60
  }
}
```

**WebSocket Endpoint**

```
GET /api/v1/interviews/ws?session_id=...&token=...
```

Upgrades after validating the one-time token and session membership. See the Real-Time Protocol section for the message flow.

**List My Sessions**

```
GET /api/v1/interviews?role=interviewer|interviewee&status=...&limit=20
Authorization: Bearer <token>
```

Returns paginated sessions for the current user, newest first. The interviewer sees `private_notes`; the interviewee does not.

# Frontend Implementation

The frontend work splits into a lobby (create/join) and the room itself. The room is a client component at `/interview/[sessionId]`, with `/interview/join/[joinCode]` as the entry point that resolves a join code into a session. Both routes use the existing AuthContext; joining requires an account, unlike quizzes, because sessions are person-to-person.

## useInterviewSocket Hook

A single hook owns the WebSocket connection, reconnection, and outbound message dispatch. It wraps the browser WebSocket with:

- exponential backoff reconnection (500 ms to 10 s) with jitter,
- a 30-second ping/pong keepalive,
- one-time token acquisition via `POST ws-token` before every connect,
- an inbound queue that buffers messages received while the editor is still initializing,
- an `onMessage` dispatch table that components subscribe to.

```typescript
function useInterviewSocket(sessionId: string) {
  const [status, setStatus] = useState<"connecting" | "open" | "closed">(
    "connecting"
  );
  const dispatch = useMemo(
    () => createMessageBus<InterviewMessage>(),
    []
  );

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retries = 0;
    let stopped = false;

    const connect = async () => {
      const { token } = await apiClient.post(
        `/interviews/${sessionId}/ws-token`
      );
      ws = new WebSocket(
        `${location.origin.replace(/^http/, "ws")}/api/v1/interviews/ws` +
          `?session_id=${sessionId}&token=${token}`
      );
      ws.onopen = () => {
        retries = 0;
        setStatus("open");
      };
      ws.onmessage = (e) => dispatch.emit(JSON.parse(e.data));
      ws.onclose = () => {
        setStatus("closed");
        if (!stopped) setTimeout(connect, backoff(retries++));
      };
    };

    connect();
    return () => {
      stopped = true;
      ws?.close();
    };
  }, [sessionId]);

  const send = useCallback((message: OutboundMessage) => {
    wsRef.current?.send(JSON.stringify(message));
  }, []);

  return { status, send, onMessage: dispatch.on };
}
```

## InterviewRoom Component

The room layout has three columns on desktop: problem and timer (left), shared editor (center), chat and run output (right). State for the whole room lives in the room component: `sessionState`, `participants`, `code`, `messages`, `runResult`.

```tsx
function InterviewRoom({ sessionId }: { sessionId: string }) {
  const { status, send, onMessage } = useInterviewSocket(sessionId);
  const [state, setState] = useState<SessionState | null>(null);
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const { data: session } = useQuery({
    queryKey: ["interview", sessionId],
    queryFn: () => apiClient.get(`/interviews/${sessionId}`),
  });

  useEffect(() => {
    const off = onMessage((msg) => {
      switch (msg.type) {
        case "session.state":
          setState(msg.payload);
          break;
        case "code.change":
          applyRemoteChange(msg.payload.version, msg.payload.content);
          break;
        case "chat.message":
          setMessages((m) => [...m, msg.payload]);
          break;
        case "run.result":
          setRunResult(msg.payload);
          break;
        case "presence.join":
        case "presence.leave":
          // update participant list
          break;
      }
    });
    return off;
  }, [onMessage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] h-screen">
      <InterviewSidebar
        state={state}
        participants={participants}
        onSelectProblem={pickProblem}
        onToggleLock={toggleLock}
      />
      <SharedEditor
        code={code}
        locked={intervieweeLocked && role === "interviewee"}
        onCodeChange={debouncedBroadcast}
        remoteCursor={remoteCursor}
      />
      <InterviewRightPanel
        messages={messages}
        runResult={runResult}
        onRun={runCode}
        onSendMessage={sendChat}
      />
    </div>
  );
}
```

## SharedEditor

Wraps the existing Monaco setup (theme, Java validator, language mapping) from `ProblemPageClient` so the room looks and behaves like the problem page. The shared editor differs in two ways:

- Every local change is debounced and broadcast as `code.change` with an incremented version.
- Remote `code.change` messages apply through `executeEdits` with the suppress flag, and the interviewee's editor is `readOnly` when the interviewer locks it.

A room header shows the timer (from `state.time_remaining_seconds`), both participant chips with presence dots, and the connection status. The run button lives in the header too so it is visible while the editor is focused.

## Problem Selection

The interviewer's sidebar lists problems from the existing problem bank (reusing the `/api/v1/problems` endpoint, grouped by pattern, searchable). Selecting one sends a `PATCH /interviews/{id}` with `problem_slug`, which triggers the `session.state` broadcast; the problem statement then renders in the left column for both participants. A problem can be swapped mid-session, which also resets the editor content to the new problem's starter template.

## End-of-Session Views

When `status` becomes `feedback`, the room swaps the editor panel for the feedback view. The interviewer sees a rating picker (1 to 5 stars) and a notes textarea, plus their private notes side by side. The interviewee sees a "waiting for feedback" screen. After `completed`, both see the replay screen:

- a timeline scrubber over code snapshots (matching the snapshot timestamps),
- chat history,
- run history with verdicts,
- the feedback report (rating, notes, and optionally the interviewer's private notes if they chose to include them).

# Security Considerations

**WebSocket Authentication.** The upgrade request is validated with a short-lived (60 s) one-time token rather than the long-lived access token, because query parameters are commonly captured in logs. The token is bound to the session ID and the user, and consumed on first use. Session membership is re-checked server-side on every stateful action; the client cannot change roles by crafting messages.

**Join Code Entropy.** The 6-character code uses an unambiguous alphabet of 30 characters (no 0/O, 1/I), giving roughly 729 million combinations. Join is rate-limited to 10 attempts per minute per IP to prevent brute-forcing codes, and codes expire when the session is completed or aborted.

**Session Authorization.** Every REST endpoint checks that the caller is either participant of the session. The interviewee must never receive `private_notes`, so the service strips them from every response when the caller's role is `interviewee`, including the replay payload.

**Message Validation.** All inbound messages are validated against the envelope schema before dispatch: types must be known, chat text capped at 2000 characters, code capped at 300 KB, and version stamps must be positive integers. Invalid messages get an `error` frame and are not persisted.

**Rate Limiting.** Each WebSocket connection is limited to 30 messages/second. Code execution borrows the existing submission rate limits (which already cap Judge0 load), so an interview session cannot be used to amplify the platform's execution bill.

**Code Execution Safety.** Execution goes through the unmodified Judge0 pipeline with its existing sandbox, resource limits, and network isolation. No new execution surface is introduced by this feature.

**Data Retention.** Sessions, messages, and snapshots are retained for replay. A "delete my session" action (future work) must cascade through the four interview tables plus the `interview_session_id` link on submissions, which is `ON DELETE SET NULL` so submission history is preserved.

# Performance Considerations

**Editor Sync Bandwidth.** Full-content sync at 150 ms debounce is acceptable for two participants: a typical solution is 5 to 20 KB, so a heavy session transfers on the order of a few MB. The 300 KB message cap bounds pathological cases (paste bombs). Diff-based sync is noted as a future optimization if latency metrics call for it.

**Snapshot Volume.** The 30-second interval plus run-time and end-of-session snapshots caps a 45-minute session at roughly 100 to 150 snapshot rows. Replay queries are indexed by `(session_id, created_at)` and paginated.

**Hub Capacity.** Each session holds at most two connections, so the hub scales with room count. The connection registry is sharded by session ID under `sync.RWMutex`; broadcast fan-out is per-room and does not touch the global lock. Prometheus gauges track connected clients and rooms for capacity planning.

**Reconnect Cost.** Reconnection performs two REST fetches (session state and code) plus a paginated chat catch-up. The version stamp makes the code fetch idempotent, so duplicate fetches from reconnect loops are harmless.

**Timer.** The server computes `time_remaining_seconds` on demand; no ticker goroutine is needed per session. Only the 15-minute janitor scan for idle sessions runs periodically.

# Deployment Considerations

WebSockets change the deployment profile of the API on Cloud Run:

- **Warm instances required.** Cloud Run scales to zero, which would drop idle WebSocket connections. The API service must set `min-instances: 1` (and ideally keep 2 during peak hours) once this feature ships.
- **No sticky sessions needed.** A WebSocket is pinned to the container that accepted it, and reconnect re-establishes on any available instance. Since all room state is in CockroachDB and clients reconcile via snapshot on reconnect, instance migration mid-session self-heals.
- **CORS and proxies.** The frontend connects with `wss://` to the same origin as the API, so the existing CORS configuration covers the upgrade if headers are permitted for the WebSocket handshake; the gorilla upgrade path must be added to the health checks' exemption list so Cloud Run's startup probe does not get hijacked as a WebSocket.

# Analytics and Metrics

The feature surfaces a few Prometheus counters on top of the existing metrics endpoint:

- `algopatterns_interview_sessions_total{status}`: sessions created, started, completed, aborted
- `algopatterns_interview_ws_connections` and `algopatterns_interview_rooms` gauges
- `algopatterns_interview_messages_relayed_total{type}`: per-message-type relay counts
- `algopatterns_interview_runs_total{verdict}`: run outcomes, reused for the submissions metric naming
- `algopatterns_interview_snapshot_total`: snapshot writes

Product analytics worth capturing in the session row (already present in the schema):

- Average session length vs. the 45-minute limit
- Rating distribution and feedback completion rate
- Problem distribution across interviews (which problems are most picked)
- Run counts per session, as a proxy for engagement

# Future Considerations

Several enhancements are considered but deferred to keep the first version focused:

**Video and Audio.** WebRTC video/audio within the room is the most obvious next step. It is deliberately excluded from v1 because it brings its own signaling, permission, and moderation surface. An interim option is a "call link" that opens a third-party video call beside the room.

**CRDT-Based Editor Sync.** Replacing last-writer-wins with a CRDT (for example Yjs, which has a Monaco binding) would remove the version-stamp reconciliation edge cases and enable the same code engine to power a future multi-user or spectator mode. The snapshot and replay schema is CRDT-compatible since it stores full content.

**Spectator Mode.** Read-only observers (a third person watching the interview, or an AI hint bot) require relaxing the two-participant constraint and adding a `spectator` role to `interview_participants` plus a read-only fan-out in the hub.

**Interview Report Generation.** Automatically generated post-interview summaries using the existing AI pipeline (structured feedback from code snapshots, run history, and chat) would complement the interviewer's manual rating. The replay payload is already shaped to feed an LLM.

**Session Deletion and Privacy.** A hard-delete flow for sessions, including the cascading cleanup described in Security Considerations.

**Hidden Test Case Runs.** Letting the interviewer reveal hidden test cases after the interview ends, so the interviewee can see whether their solution passes full evaluation.

**Diff-Based Snapshots.** Storing per-snapshot diffs instead of full content to shrink storage for long sessions.

**Interview Templates.** Predefined interviewer scripts (question sequences with hints and rubric) stored as templates, so interviewers who want structure can load one.

# Implementation Plan

## Phase 1: Backend Foundation
- [ ] Add `github.com/gorilla/websocket` dependency
- [ ] Migration `015_create_interview_tables.up.sql`: four tables + submissions FK
- [ ] Models: `InterviewSession`, `InterviewParticipant`, `InterviewMessage`, `InterviewCodeSnapshot`
- [ ] Repository: interview repository with session CRUD, messages, snapshots, replay query
- [ ] Service: state machine (waiting to completed/aborted), join validation, feedback
- [ ] One-time WS token issuance using the existing JWT machinery

## Phase 2: WebSocket Hub
- [ ] Hub, Room, Client types with reader/writer pumps
- [ ] Message envelope validation and dispatch table
- [ ] Code change relay with Lamport version stamps
- [ ] Chat relay and persistence
- [ ] Presence (join/leave) events
- [ ] Run request handling wired into the existing Submission Service
- [ ] Rate limiting and message caps

## Phase 3: REST API
- [ ] Create, join, get state, update, feedback, code, replay, list endpoints
- [ ] Interviewee role stripping for `private_notes`
- [ ] Handler tests following the existing manual-stub test pattern

## Phase 4: Frontend Room
- [ ] `useInterviewSocket` hook with reconnect and backoff
- [ ] Lobby pages: create session, join with code, invite link copy
- [ ] `InterviewRoom` layout with timer, participants, and presence
- [ ] `SharedEditor` with broadcast, remote apply, cursor, and lock
- [ ] Chat panel with typing indicator
- [ ] Run panel wired to `run.submit` and `run.result`

## Phase 5: Session End and Replay
- [ ] Feedback view (rating, notes) for the interviewer
- [ ] Waiting screen for the interviewee
- [ ] Replay screen with snapshot scrubber, chat, runs, feedback
- [ ] My Sessions list page

## Phase 6: Hardening
- [ ] Janitor job for idle session abort
- [ ] Prometheus metrics for sessions, connections, relay counts, runs
- [ ] Cloud Run min-instances and CORS verification
- [ ] End-to-end smoke test with two browser profiles

# Files to Create

```
Backend:
├── internal/handlers/interview_handler.go        # REST endpoints
├── internal/services/interview_service.go        # State machine + persistence
├── internal/services/interview_hub.go            # WebSocket hub, room, client
├── internal/repository/interview_repository.go   # Session, messages, snapshots
├── internal/models/interview.go                  # Domain models
└── migrations/
    ├── 015_create_interview_tables.up.sql
    └── 015_create_interview_tables.down.sql

Frontend:
├── src/app/interview/
│   ├── page.tsx                      # My Sessions list
│   ├── create/page.tsx               # Create session (lobby)
│   ├── join/[joinCode]/page.tsx      # Join by code
│   └── [sessionId]/page.tsx          # Interview room
├── src/components/interview/
│   ├── InterviewRoom.tsx             # Room layout and state
│   ├── InterviewSidebar.tsx          # Problem picker, timer, participants
│   ├── SharedEditor.tsx              # Monaco with sync protocol
│   ├── ChatPanel.tsx                 # Messages + typing indicator
│   ├── RunPanel.tsx                  # Run output
│   ├── FeedbackView.tsx              # Rating + notes (interviewer)
│   ├── WaitingView.tsx               # End-of-session waiting (interviewee)
│   └── ReplayView.tsx                # Snapshot scrubber + history
├── src/hooks/useInterviewSocket.ts   # WS client with reconnect
└── src/types/interview.ts            # Message union types + session types
```

# References

- [gorilla/websocket](https://github.com/gorilla/websocket) - WebSocket library for the Go hub
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/docs.html) - Editor model, decorations, and cursor APIs used by the shared editor
- [Yjs](https://github.com/yjs/yjs) - CRDT library under consideration for future editor sync
- [Lamport Timestamps](https://en.wikipedia.org/wiki/Lamport_timestamp) - Version stamping used by the last-writer-wins protocol
- [Cloud Run WebSocket Support](https://cloud.google.com/run/docs/triggering/websockets) - Deployment constraints for WebSocket endpoints
