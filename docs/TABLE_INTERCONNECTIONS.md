# Table interconnections

This document shows how every database table connects to others: foreign keys, logical references, and data flow.

---

## 1. Full system diagram (all tables)

```mermaid
erDiagram
    users ||--o{ user_activities : "user_id"
    users ||--o{ user_interactions : "user_id"
    startups ||--o{ team_members : "startup_id"
    startups ||--o{ leaderboard : "startup_id"
    startups ||--o{ user_activities : "startup_id"
    startups ||--o{ user_interactions : "startup_id"
    startups ||--o{ startup_support : "startup_id"

    hackathons ||--o{ hackathon_winners : "hackathon_id"
    hackathons ||--o{ hackathon_invitations : "hackathon_id"
    hackathons ||--o{ hackathon_participants : "hackathon_id"
    hackathons ||--o{ hackathon_judges : "hackathon_id"
    hackathons ||--o{ hackathon_awards : "hackathon_id"
    hackathons ||--o{ hackathon_criteria : "hackathon_id"
    hackathons ||--o{ hackathon_scores : "hackathon_id"

    hackathon_participants ||--o{ hackathon_scores : "project_id = participant.id"
    hackathon_judges ||--o{ hackathon_scores : "judge_id"
    hackathon_criteria ||--o{ hackathon_scores : "criterion_id"
    hackathon_invitations ||--o| hackathon_participants : "invited_via = invitation.id"
    hackathon_awards ||--o| hackathon_winners : "sync when project_id set"

    users {
        int id PK
        string name
        string email UK
        string avatar_url
        text bio
        string role
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }

    startups {
        int id PK
        string name
        string tagline
        text description
        string category
        string stage
        date founded_date
        string users
        string growth
        int status
        string founder_name
        string founder_email
        text founder_bio
        string team_size
        text problem
        text solution
        text target_market
        text business_model
        string revenue
        string funding
        string website
        string email
        string twitter
        string linkedin
        string github
        text milestones
        text challenges
        text vision
        text admin_feedback
        timestamp reviewed_at
        string reviewed_by
        timestamp created_at
        timestamp updated_at
    }

    team_members {
        int id PK
        int startup_id FK
        string name
        string role
        text bio
        timestamp created_at
    }

    leaderboard {
        int id PK
        int startup_id FK
        int rank
        string growth_rate
        timestamp created_at
        timestamp updated_at
    }

    user_activities {
        int id PK
        int user_id FK
        int startup_id FK
        string activity_type
        jsonb activity_data
        timestamp created_at
    }

    user_interactions {
        int id PK
        int user_id FK
        int startup_id FK
        string interaction_type
        jsonb interaction_data
        string status
        timestamp created_at
        timestamp updated_at
    }

    startup_support {
        int id PK
        int startup_id FK
        string support_type
        string title
        text description
        text requirements
        jsonb contact_info
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    hackathons {
        text id PK
        string name
        text description
        date start_date
        date end_date
        string location
        text host_id "no FK, user id"
        jsonb sponsors
        string status
        int participants_count
        text image
        string total_prize
        jsonb tech_stack
        string level
        string event_type
        boolean recommended
        timestamp created_at
        timestamp updated_at
    }

    hackathon_winners {
        text id PK
        text hackathon_id FK
        text project_id "participant id"
        string project_name
        string prize
        int rank
        boolean advanced_to_launch_pad
        timestamp created_at
    }

    hackathon_invitations {
        text id PK
        text hackathon_id FK
        string email
        text user_id
        string role
        string status
        timestamp invited_at
        timestamp responded_at
        text invited_by
    }

    hackathon_participants {
        text id PK
        text hackathon_id FK
        text user_id
        text project_id
        string project_name
        string team_name
        string status
        text invited_via "invitation id"
        timestamp registered_at
        timestamp submitted_at
        text pitch_text
        string repo_url
        string demo_url
    }

    hackathon_judges {
        text id PK
        text hackathon_id FK
        text user_id
        string name
        string email
        string avatar
        timestamp invited_at
        timestamp accepted_at
    }

    hackathon_awards {
        text id PK
        text hackathon_id FK
        string name
        text description
        int rank
        string prize
        text project_id "when winner assigned"
        string project_name
        timestamp created_at
    }

    hackathon_criteria {
        text id PK
        text hackathon_id FK
        string name
        text description
        int weight
        int order
        timestamp created_at
    }

    hackathon_scores {
        text id PK
        text hackathon_id FK
        text project_id "participant id"
        text judge_id
        text criterion_id
        numeric score
        text feedback
        timestamp submitted_at
    }
```

---

## 2. Core domain: users and startups

Only tables that have **integer IDs** and explicit **foreign keys** in the schema.

```mermaid
flowchart LR
    subgraph Users
        users[(users)]
    end
    subgraph Startups
        startups[(startups)]
        team_members[(team_members)]
        leaderboard[(leaderboard)]
        startup_support[(startup_support)]
    end
    subgraph Activity
        user_activities[(user_activities)]
        user_interactions[(user_interactions)]
    end

    users -->|user_id| user_activities
    users -->|user_id| user_interactions
    startups -->|startup_id| team_members
    startups -->|startup_id| leaderboard
    startups -->|startup_id| startup_support
    startups -->|startup_id| user_activities
    startups -->|startup_id| user_interactions
```

| From table           | To table           | Column       | References        | Constraint   |
|----------------------|--------------------|-------------|-------------------|--------------|
| team_members          | startups           | startup_id  | startups.id       | ON DELETE CASCADE |
| leaderboard           | startups           | startup_id  | startups.id       | —            |
| user_activities       | users              | user_id     | users.id          | ON DELETE CASCADE |
| user_activities       | startups           | startup_id  | startups.id       | ON DELETE CASCADE |
| user_interactions     | users              | user_id     | users.id          | ON DELETE CASCADE |
| user_interactions     | startups           | startup_id  | startups.id       | ON DELETE CASCADE |
| startup_support       | startups           | startup_id  | startups.id       | ON DELETE CASCADE |

---

## 3. Hackathon domain: how tables interconnect

All hackathon tables use **text IDs** and reference **hackathons(id)** with `ON DELETE CASCADE`.

### 3.1 Direct foreign keys (in schema)

| From table              | To table    | Column       | References     |
|-------------------------|------------|--------------|----------------|
| hackathon_winners       | hackathons | hackathon_id | hackathons.id  |
| hackathon_invitations   | hackathons | hackathon_id | hackathons.id  |
| hackathon_participants | hackathons | hackathon_id | hackathons.id  |
| hackathon_judges       | hackathons | hackathon_id | hackathons.id  |
| hackathon_awards      | hackathons | hackathon_id | hackathons.id  |
| hackathon_criteria     | hackathons | hackathon_id | hackathons.id  |
| hackathon_scores       | hackathons | hackathon_id | hackathons.id  |

### 3.2 Logical / application-level links (no FK in DB)

| From table / column     | Points to                    | Meaning |
|-------------------------|-----------------------------|--------|
| hackathons.host_id      | users (by app logic)        | User who created the hackathon (string id) |
| hackathon_participants.invited_via | hackathon_invitations.id | Invitation that led to this registration |
| hackathon_scores.project_id | hackathon_participants.id | The submission being scored |
| hackathon_scores.judge_id   | hackathon_judges.id         | Judge who gave the score |
| hackathon_scores.criterion_id | hackathon_criteria.id    | Criterion (or null = overall) |
| hackathon_awards.project_id | hackathon_participants.id | Winner assigned to this award |
| hackathon_winners.project_id | hackathon_participants.id | Synced from hackathon_awards when winner set |

### 3.3 Hackathon interconnection diagram

```mermaid
flowchart TB
    subgraph Hackathon
        H[(hackathons)]
    end
    subgraph People
        INV[(hackathon_invitations)]
        PAR[(hackathon_participants)]
        JUD[(hackathon_judges)]
    end
    subgraph Judging
        CRIT[(hackathon_criteria)]
        SCORES[(hackathon_scores)]
        AWARDS[(hackathon_awards)]
        WIN[(hackathon_winners)]
    end

    H --> INV
    H --> PAR
    H --> JUD
    H --> CRIT
    H --> AWARDS
    H --> SCORES
    H --> WIN

    INV -.->|invited_via| PAR
    PAR -->|project_id| SCORES
    JUD -->|judge_id| SCORES
    CRIT -->|criterion_id| SCORES
    AWARDS -.->|project_id assign -> sync| WIN
```

---

## 4. Relationship summary

| Relationship type | Example |
|--------------------|--------|
| **One-to-many (FK)** | One `startups` row → many `team_members`, `leaderboard`, `startup_support`. One `hackathons` row → many `hackathon_participants`, `hackathon_scores`, etc. |
| **Many-to-one (FK)** | Many `user_activities` → one `users`; many `hackathon_scores` → one `hackathons`. |
| **Logical (no FK)** | `hackathon_scores.project_id` = `hackathon_participants.id`; `hackathon_scores.judge_id` = `hackathon_judges.id`; `hackathon_awards.project_id` → participant, then synced to `hackathon_winners`. |
| **Sync** | When an award winner is set (`hackathon_awards.project_id`), rows are synced into `hackathon_winners`. |

---

## 5. ID spaces

- **Integer IDs (SERIAL):** `users`, `startups`, `team_members`, `leaderboard`, `user_activities`, `user_interactions`, `startup_support`.
- **Text IDs (TEXT PK):** All hackathon tables. Hackathon domain does not use integer FKs to `users`; it uses string `user_id` / `host_id` for application-level linking.

For a visual ER view of columns only, see [SCHEMA_DATABASE.md](SCHEMA_DATABASE.md) and [HACKATHON_MODULE_SCHEMA.md](HACKATHON_MODULE_SCHEMA.md).
