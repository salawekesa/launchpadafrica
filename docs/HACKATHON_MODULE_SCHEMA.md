# Hackathon Module — Database Schema

Detailed schema for the hackathon feature: tables, columns, and relationships.

## Entity Relationship Diagram (hackathon only)

```mermaid
erDiagram
    hackathons ||--o{ hackathon_winners : "winners"
    hackathons ||--o{ hackathon_invitations : "invites"
    hackathons ||--o{ hackathon_participants : "participants"
    hackathons ||--o{ hackathon_judges : "judges"
    hackathons ||--o{ hackathon_awards : "awards"
    hackathons ||--o{ hackathon_criteria : "criteria"
    hackathons ||--o{ hackathon_scores : "scores"
    hackathon_participants ||--o{ hackathon_scores : "project_id"
    hackathon_judges ||--o{ hackathon_scores : "judge_id"
    hackathon_criteria ||--o{ hackathon_scores : "criterion_id"
    hackathon_awards }o--|| hackathon_winners : "sync"

    hackathons {
        TEXT id PK
        VARCHAR name
        TEXT description
        DATE start_date
        DATE end_date
        VARCHAR location
        TEXT host_id "user id of host"
        JSONB sponsors "array of {name, tier}"
        VARCHAR status "draft|upcoming|active|judging|completed"
        INTEGER participants_count
        TEXT image "cover image URL"
        VARCHAR total_prize "e.g. 150000USD"
        JSONB tech_stack "e.g. [Solidity, React]"
        VARCHAR level "e.g. general"
        VARCHAR event_type "online|hybrid"
        BOOLEAN recommended
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    hackathon_winners {
        TEXT id PK
        TEXT hackathon_id FK
        TEXT project_id "from participant"
        VARCHAR project_name
        VARCHAR prize
        INTEGER rank "1=first"
        BOOLEAN advanced_to_launch_pad
        TIMESTAMP created_at
    }

    hackathon_invitations {
        TEXT id PK
        TEXT hackathon_id FK
        VARCHAR email
        TEXT user_id
        VARCHAR role "participant|judge"
        VARCHAR status "pending|accepted|declined"
        TIMESTAMP invited_at
        TIMESTAMP responded_at
        TEXT invited_by
    }

    hackathon_participants {
        TEXT id PK
        TEXT hackathon_id FK
        TEXT user_id "team lead"
        TEXT project_id "optional link"
        VARCHAR project_name
        VARCHAR team_name
        VARCHAR status "registered|submitted"
        TEXT invited_via "invitation id"
        TIMESTAMP registered_at
        TIMESTAMP submitted_at
        TEXT pitch_text
        VARCHAR repo_url
        VARCHAR demo_url
    }

    hackathon_judges {
        TEXT id PK
        TEXT hackathon_id FK
        TEXT user_id
        VARCHAR name
        VARCHAR email
        VARCHAR avatar
        TIMESTAMP invited_at
        TIMESTAMP accepted_at
    }

    hackathon_awards {
        TEXT id PK
        TEXT hackathon_id FK
        VARCHAR name
        TEXT description
        INTEGER rank "1=first place"
        VARCHAR prize "e.g. 10000 USD"
        TEXT project_id "when winner assigned"
        VARCHAR project_name
        TIMESTAMP created_at
    }

    hackathon_criteria {
        TEXT id PK
        TEXT hackathon_id FK
        VARCHAR name
        TEXT description
        INTEGER weight "0-100, sum=100"
        INTEGER order
        TIMESTAMP created_at
    }

    hackathon_scores {
        TEXT id PK
        TEXT hackathon_id FK
        TEXT project_id "participant project"
        TEXT judge_id
        TEXT criterion_id "nullable = overall"
        NUMERIC score "0-100"
        TEXT feedback
        TIMESTAMP submitted_at
    }
```

## Table summary

| Table | Purpose |
|-------|--------|
| **hackathons** | Event definition: name, dates, location, host, status, display fields (image, total_prize, tech_stack, level, event_type, recommended). |
| **hackathon_winners** | Display list of winners (synced from hackathon_awards when project_id is set). |
| **hackathon_invitations** | Invites by email/user to participate or judge. |
| **hackathon_participants** | Registration + submission: user_id, optional project_name/team_name, pitch_text, repo_url, demo_url, status, submitted_at. |
| **hackathon_judges** | Judges per hackathon (user_id, name, email). |
| **hackathon_awards** | Prize definitions (rank, prize); project_id/project_name set when winner is assigned. |
| **hackathon_criteria** | Judging criteria with weight (used for weighted scoreboard). |
| **hackathon_scores** | Judge scores per project, optionally per criterion. |

## Key flows in data

1. **Create hackathon** → insert `hackathons`; optionally insert `hackathon_awards` and `hackathon_criteria`.
2. **Register / submit** → insert or update `hackathon_participants` (project_name, pitch_text, repo_url, demo_url, status, submitted_at).
3. **Judging** → insert/update `hackathon_scores` (project_id, judge_id, criterion_id, score).
4. **Scoreboard** → computed from `hackathon_scores` + `hackathon_criteria` (weighted average).
5. **Finalize** → assign `hackathon_awards.project_id`/`project_name` by rank from scoreboard; sync into `hackathon_winners`; set `hackathons.status = 'completed'`.
