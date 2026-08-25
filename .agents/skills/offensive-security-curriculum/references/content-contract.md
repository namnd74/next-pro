# Lesson Content Contract

## Required metadata

Every lesson must define:

- stable `id` and `slug`;
- title and concise summary;
- difficulty and estimated duration;
- measurable learning outcomes;
- prerequisites by stable ID;
- career paths, domains, ATT&CK mappings when justified, and keywords;
- lab mode and safety level;
- authoritative sources.

## Required teaching structure

1. **Outcome:** what the learner can demonstrably do afterward.
2. **Prerequisites:** knowledge and labs assumed by the lesson.
3. **Mental model:** a compact causal model, not an analogy alone.
4. **Mechanism:** actors, assets, boundaries, state transitions, and failure point.
5. **Visual explanation:** diagram, timeline, graph, packet flow, memory layout, or
   metric chart selected for the domain.
6. **Minimal safe demonstration:** isolates one mechanism and explains every step.
7. **Guided lab:** objective, environment, setup, task, evidence, reset, cleanup.
8. **Blind variant:** changes context or removes the named vulnerability.
9. **Defensive analysis:** prevention, detection, response, and residual risk.
10. **Misconceptions and failure modes:** plausible wrong answers and why they fail.
11. **Assessment:** recall, diagnosis, and transfer—not three definition questions.
12. **Further reading:** directly relevant sources with attribution.

## Evidence contract

A learner action is not completion by itself. Require one or more observable artifacts:

- annotated packet/request/response;
- screenshot showing a defined state;
- sanitized console or event log;
- test output;
- before/after metric;
- attack-path graph;
- root-cause explanation;
- remediation diff and regression result;
- concise finding with impact and reproduction steps.

## Assessment ladder

- **Demo:** observe a known mechanism.
- **Guided lab:** reproduce with progressive hints.
- **Blind lab:** identify the weakness without being told its category.
- **Transfer challenge:** recognize a variation in a new stack or topology.
- **Capstone:** chain multiple domains under Rules of Engagement and produce a report.

## Writing rules

- Define a term before relying on it.
- Explain why each important step works, not only what to click or run.
- Tie impact to a protected asset and trust boundary.
- Separate normal administration concepts from adversarial abuse.
- Show vulnerable and remediated behavior; verify the remediation.
- State assumptions, environmental differences, and version-sensitive facts.
- Never present simulated UI output as proof of a real operating-system or network
  behavior.
- Prefer concise exact language over dramatic attack-themed copy.

## Source representation

Store at least:

```json
{
  "title": "Source title",
  "url": "https://example.org/source",
  "publisher": "Publisher",
  "sourceType": "official-standard",
  "accessedAt": "YYYY-MM-DD",
  "supports": ["specific claim or section"]
}
```

The repository schema may use a simpler source shape today. Preserve compatibility,
but retain this information in the curriculum manifest or future schema proposal.
