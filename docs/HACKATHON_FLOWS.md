# Hackathon Module — Flows

End-to-end flows: submission, judging, and finalize.

## 1. Project submission flow

```mermaid
sequenceDiagram
    participant U as User (participant)
    participant P as HackathonSubmit page
    participant S as useHackathonStore
    participant API as hackathon-api
    participant Server as Express
    participant DB as hackathon-db

    U->>P: Open /hackathon/:id/submit
    P->>S: getMyParticipation(hackathonId, userId)
    S->>API: GET .../participants/me?userId=
    API->>Server: GET
    Server->>DB: dbGetParticipantByHackathonAndUser
    DB-->>Server: participant or 404
    Server-->>API: JSON
    API-->>S: participation
    S-->>P: participation (or null)

    alt Not registered
        P->>P: Show form (project name, team, pitch, repo, demo)
        U->>P: Submit
        P->>S: submitProject({ hackathonId, userId, projectName, ... })
        S->>API: POST .../participants (with pitchText, repoUrl, demoUrl)
        API->>Server: POST
        Server->>DB: dbCreateParticipant (creates or updates if same user)
        DB-->>Server: participant
        Server-->>API: 201
        API-->>S: participant
        S->>S: loadHackathonById (refresh)
        S-->>P: success
    else Already registered, not submitted
        P->>P: Prefill form from participation
        U->>P: Submit
        P->>S: submitProject({ ... })
        S->>API: PUT .../participants/:participantId
        API->>Server: PUT
        Server->>DB: dbUpdateParticipant (project_name, pitch_text, repo_url, demo_url, status=submitted)
        DB-->>Server: participant
        Server-->>API: 200
        API-->>S: participant
        S-->>P: success
    end
```

## 2. Judging flow (weighted scoreboard)

```mermaid
sequenceDiagram
    participant J as Judge
    participant M as HackathonManage (Judge tab)
    participant S as useHackathonStore
    participant API as hackathon-api
    participant Server as Express
    participant DB as hackathon-db

    J->>M: Submit score (project, criteria, score 0-100)
    M->>S: submitScore({ hackathonId, projectId, judgeId, criterionId, score, feedback })
    S->>API: POST .../scores
    API->>Server: POST
    Server->>DB: dbUpsertScore (insert or update per project+judge+criterion)
    DB-->>Server: score row
    Server-->>API: 201
    API-->>S: ok
    S->>S: loadHackathonById (refresh)

    Note over DB: Scoreboard = weighted average
    M->>S: getScoreboard(hackathonId)
    S->>S: from currentHackathon.scoreboard (from last load)
    alt Need fresh scoreboard
        S->>API: GET .../scoreboard
        API->>Server: GET
        Server->>DB: dbGetScoreboard(hackathonId)
        DB->>DB: Get criteria (weights), scores; per project: sum(avg(score)_c * weight_c/100)
        DB-->>Server: [{ projectId, projectName, totalScore, averageScore, scoreCount, rank }]
        Server-->>API: JSON
        API-->>S: scoreboard
    end
    S-->>M: scoreboard (ranked, weighted)
```

## 3. Finalize winners flow (automated)

```mermaid
sequenceDiagram
    participant H as Host
    participant M as HackathonManage (Scoreboard tab)
    participant S as useHackathonStore
    participant API as hackathon-api
    participant Server as Express
    participant DB as hackathon-db

    H->>M: Click "Finalize winners"
    M->>S: finalizeWinners(hackathonId)
    S->>API: POST .../finalize-winners
    API->>Server: POST
    Server->>DB: dbFinalizeWinners(hackathonId)

    DB->>DB: dbGetScoreboard (weighted, ranked)
    DB->>DB: dbGetAwardsByHackathon (ordered by rank)
    loop For each award rank
        DB->>DB: dbAssignAwardWinner(awardId, projectId from scoreboard[rank], projectName)
        DB->>DB: UPDATE hackathon_awards SET project_id, project_name
        DB->>DB: dbSyncWinnersFromAwards (DELETE hackathon_winners, INSERT from awards)
    end
    DB->>DB: dbUpdateHackathon(id, { status: 'completed' })
    DB-->>Server: { assigned: N }
    Server->>Server: dbGetHackathonFull(id)
    Server-->>API: { assigned, hackathon }
    API-->>S: result
    S->>S: set hackathons/currentHackathon with updated hackathon
    S-->>M: { assigned }
    M->>M: loadHackathonById (refresh UI)
```

## 4. State flow (store ↔ API ↔ DB)

```mermaid
flowchart LR
    subgraph UI
        A[Pages]
    end
    subgraph Store
        B[loadHackathons / loadHackathonById]
        C[submitProject / submitScore / finalizeWinners]
        B --> D[getHackathons / getHackathonById]
        C --> B
    end
    subgraph API
        E[apiGetHackathons / apiGetHackathonById]
        F[apiUpdateParticipant / apiSubmitScore / apiFinalizeWinners]
    end
    subgraph Server
        G[GET/POST/PUT routes]
    end
    subgraph DB
        H[dbGetHackathons / dbGetHackathonFull]
        I[dbUpdateParticipant / dbUpsertScore / dbFinalizeWinners]
    end

    A --> B
    A --> C
    A --> D
    B --> E
    C --> F
    E --> G
    F --> G
    G --> H
    G --> I
```

- **Read**: UI calls `loadHackathons()` or `loadHackathonById()` → store calls API → server calls hackathon-db → store sets `hackathons` / `currentHackathon`; UI uses `getHackathons()` / `getHackathonById()`.
- **Write**: UI calls `submitProject()`, `submitScore()`, or `finalizeWinners()` → store calls API → server calls hackathon-db → store refreshes with `loadHackathonById()` so UI sees updated data.
