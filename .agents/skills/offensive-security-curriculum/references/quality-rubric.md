# Curriculum Quality Rubric

Score every dimension from 0 to 2. A lesson cannot be `validated` with any zero or a
total below 18/22.

| Dimension     | 0                    | 1                    | 2                                          |
| ------------- | -------------------- | -------------------- | ------------------------------------------ |
| Taxonomy      | mixed or wrong       | mostly correct       | correct on all four axes                   |
| Outcomes      | vague                | partly observable    | measurable learner capability              |
| Prerequisites | missing              | informal             | stable, testable dependencies              |
| Mental model  | slogan               | partial              | causal actors/boundaries/state             |
| Mechanism     | steps only           | some explanation     | explains why and failure point             |
| Demonstration | decorative           | reproduces one path  | bounded, explained, reproducible           |
| Lab evidence  | button/progress only | one weak artifact    | objective evidence and criteria            |
| Transfer      | copied variation     | small change         | new context requiring diagnosis            |
| Defense       | checklist only       | mitigation described | mitigation verified plus residual risk     |
| Detection     | absent               | generic logs         | specific telemetry and testable hypothesis |
| Sources       | weak/outdated        | mixed                | current primary/authoritative support      |

## Automatic rejection

- Targets or credentials can be supplied arbitrarily to an offensive lab.
- A DDoS/botnet lab can reach external targets or exceed a hard resource ceiling.
- A lesson claims simulation output is proof of actual OS/network behavior.
- Answers are vague, reveal no mechanism, or merely repeat the question.
- The mitigation is not tested against the demonstrated failure.
- A real vulnerability/version claim lacks a primary source.
- A reliability bug is branded an attack without attacker control and security impact.
- The manifest is marked ahead of actual implementation or validation.

## Review record

Store the score, reviewer notes, passed checks, unavailable checks, and remaining
risks in `docs/offensive-security/GENERATION_STATUS.md` or the future lesson review metadata.
