# Scholia

A study partner that only works because the course content is structured.

Scholia turns everything a course throws at a student (lecture recordings, slide decks, a textbook,
assignments, graded submissions) into typed Sanity documents, builds a Sanity Knowledge Base on top, and
puts an agent in front of it. Every answer cites the exact lecture second, slide number or book page.

Built for the DEV x Sanity Challenge (Path One). Demo course: MIT OCW 6.0001 (CC BY-NC-SA 4.0) with
Think Python 2e (CC BY-NC 3.0). The student's submissions and grader feedback are fictional.

- Sanity project `dqd1lxzm`, dataset `production` (public)
- Live: https://scholia.mol.la

## Modes

| Mode | What it does | What makes it possible |
|---|---|---|
| Study | Explains a concept, cites lecture timestamp, slide and page | `lecture.segments[]` with `startSec`, `slideDeck.slides[].number`, `bookSection.pageStart` |
| Assignment | Guides through a problem set under its rubric, never hands over code | `assignment.rubric[]` → `topics[]` → `relatedLectures[]` |
| Improve | Finds weak topics from grader feedback | `submission.feedback[].criterionKey` → `rubricCriterion.topics[]` |
| Revise | Topic-by-topic revision sheet with sources | topic references on every segment, slide and section |
| Mock exam | Weighted questions, one at a time, graded with citations | `examScope.topics[].weight` → `topic` → `learningObjective` |

When the course does not cover a question, Scholia searches a short allowlist of trusted domains and
shows results separately as "Outside course material". A useful result can be saved as a `webReference`
for staff review (through the Sanity client; Context MCP is read-only).

## How the agent reads content

1. Sanity Context MCP in Knowledge Base mode: `initial_context`, `knowledge_base_search`, `knowledge_base_read`.
2. `lookup_source`: GROQ over the typed arrays for exact locators. The Knowledge Base explains; this pins it.
3. `weak_topics`, `exam_plan`: deterministic GROQ aggregations the model cannot get wrong.
4. `web_search` (Tavily, domain allowlist) and `save_web_reference`.

Citations use a fixed syntax (`[lecture 6 @ 12:40]`, `[slides 4 #5]`, `[book ch.11 p.106]`) that the UI
parses and resolves. Citations the tools did not return are flagged "unverified".

## Run it

Everything runs in Docker.

```sh
cp .env.example .env            # fill in tokens
docker compose up               # http://localhost:3000, Studio at /studio
```

Ingest the demo course (downloads openly licensed material into `data/raw`, gitignored):

```sh
./scripts/download-sources.sh
docker compose run --rm tools npx tsx scripts/ingest/build.ts
docker compose run --rm tools npx tsx scripts/ingest/push.ts
docker compose run --rm tools npx tsx scripts/ingest/verify.ts
docker compose run --rm tools npx sanity schema deploy
```

Then in the Sanity Dashboard: Context → New knowledge base → Dataset source → Build entries → create an
MCP endpoint with the Knowledge Base as its only source, and put its URL in `.env`.

Tests and checks:

```sh
docker compose run --rm tools npm test
docker compose run --rm tools npm run typecheck
docker compose run --rm tools npm run lint
```

## Deploy (AWS, near zero idle cost)

Container Lambda with the Lambda Web Adapter (response streaming) behind an IAM-protected Function URL and
CloudFront (origin access control). Only the custom domain is served.

```sh
docker compose run --rm cdk npx cdk deploy -c domain=scholia.mol.la -c certArn=arn:aws:acm:...
```

## Stack

Next.js 16, Sanity 6 (embedded Studio), Vercel AI SDK 7 with `@ai-sdk/mcp`, Amazon Bedrock (Nova 2 Lite),
Tavily, AWS CDK. An earlier prototype of the idea, `SumonMSelim/scholia-aws` (Go, Bedrock, no Sanity),
informed the refusal wording and the mock-exam flow; no code was reused.

## License

MIT. Course material belongs to its authors under the licenses noted above.
