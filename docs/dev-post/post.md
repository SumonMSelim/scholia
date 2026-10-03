---
title: "Scholia: an AI study partner that answers from course knowledgebase"
published: true
tags: devchallenge, sanitychallenge, sanity, ai
---

*This is a submission for the [Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16): Path One, Ship an Agent That Queries Real Content.*

## What I Built

Scholia is a study partner for one course. You ask it something, and it answers from that course's own material: the lecture recordings, the slide decks, the textbook, the problem sets and their rubrics, and your own graded work. Every claim comes with a chip you can click. A lecture chip opens the YouTube recording at that second. A slide chip names the deck and slide number. A book chip names the chapter and page.

It has five modes, and each one only works because the content is structured:

| Mode | What you get | What in the schema makes it possible |
|---|---|---|
| **Study** | An explanation in the course's own terms, with where to see it again | `lecture.segments[]` carry `startSec`; `slideDeck.slides[]` carry `number`; `bookChapter.sections[]` carry `pageStart` |
| **Assignment** | Guidance through a problem set, step by step, under its rubric, without the solution | `assignment.rubric[]` criteria each reference `topics[]`, and assignments reference `relatedLectures[]` |
| **Improve** | Where you are losing marks and exactly what to rewatch | `submission.feedback[].criterionKey` points at a rubric criterion, which points at topics, which are referenced by segments, slides and sections |
| **Revise** | A revision sheet per topic, every bullet cited | topic references on every segment, slide and book section |
| **Mock exam** | Questions one at a time, sampled by exam weight, graded out of 10 with citations | `examScope.topics[]` carry a `weight` and point at topics and learning objectives |

When the course does not cover something, Scholia searches a short allowlist of trusted sites (docs.python.org, ocw.mit.edu, Wikipedia and a few universities). Those results never mix with course citations. They appear in an amber "Outside course material" section, and a useful one can be saved back to Sanity as a `webReference` for course staff to review.

There are three demo courses, all from MIT OpenCourseWare (CC BY-NC-SA 4.0), each paired with an openly licensed textbook:

- **6.0001** Introduction to Computer Science and Programming in Python, with Allen Downey's *Think Python 2e* (CC BY-NC 3.0)
- **6.0002** Introduction to Computational Thinking and Data Science, with Allen Downey's *Think Stats 2e* (CC BY-NC-SA 4.0)
- **6.006** Introduction to Algorithms, with Pat Morin's *Open Data Structures* (CC BY 2.5 Canada)

The graded submissions and their grader feedback are fictional, written so Improve mode has something to work with. The examples below use 6.0001.

### What it answers that keyword search could not

**"Where am I losing marks, and what should I rewatch?"** None of those words appears in the course material. To answer, the agent has to walk a chain: each piece of grader feedback names a rubric criterion by key, each criterion is tagged with topics, and each topic is referenced by specific lecture segments, slides and book sections. Scholia does the walk in GROQ, deterministically, then asks for the exact locators:

> **Recursion** (lost 3 points, 1 major). Base case handling in recursive permutations. Rewatch: understanding base cases and recursive unwinding `Lecture 6 · 13:17`; slides on recursive multiplication and factorial `Lecture 6 · slide 9`.
>
> **Dictionaries, tuples, lists and mutability** (lost 2 points each). Mutating the input hand instead of cloning it. Rewatch: cloning lists to avoid aliasing side effects `Lecture 5 · 35:08`; list cloning with slicing `Lecture 5 · slide 20`.

The bars in the side panel (points lost per topic, across all four submissions) come from the same query, not from the model.

**"What is the complexity of `bisect_search1`?"** A keyword search finds slide 14 of lecture 11, and that slide says two things. It first multiplies O(log n) calls by O(n) copying per call and writes O(n log n). A few lines later it says "if we are really careful", the copied lengths halve each time, so the total is O(n). The Knowledge Base build flagged this as a conflict between entries. Scholia answered O(n) with the halving-series argument and cited the slide. I return to this below, because it did not mention the conflict.

**"What is the walrus operator, and does this course cover it?"** The course predates Python 3.8. Scholia says so in one sentence, then answers under "Outside course material" from docs.python.org, shown apart from the course sources.

## Demo

**Live:** https://scholia.mol.la (no login). Studio is embedded at https://scholia.mol.la/studio.

Try these:

- Study: *Why does recursion need a base case?*
- Improve: *Where am I losing marks, and what should I rewatch?*
- Assignment: *Help me start problem set 3 without giving me the answer.*
- Mock exam: *Start a mock exam.* Then answer the first question.
- Study: *What is the walrus operator?* (watch it leave the course)

![Study mode: the answer cites Lecture 6 at 4:53, slide 6 and Lecture 6 at 19:18 inline, and the panel lists the same sources](https://raw.githubusercontent.com/SumonMSelim/scholia/main/docs/dev-post/study-light.png)

![A question the course does not cover: one sentence saying so, then an answer from docs.python.org under Outside course material](https://raw.githubusercontent.com/SumonMSelim/scholia/main/docs/dev-post/web-fallback.png)

![Dark theme](https://raw.githubusercontent.com/SumonMSelim/scholia/main/docs/dev-post/study-dark.png)
![Phone layout](https://raw.githubusercontent.com/SumonMSelim/scholia/main/docs/dev-post/mobile.png)

## Code

{% github SumonMSelim/scholia %}

Next.js 16 with an embedded Sanity Studio 6, the Vercel AI SDK 7 with its MCP client, Amazon Bedrock (Nova 2 Lite), Tavily for the web fallback, and AWS CDK for the deploy. Everything, including the CDK deploy and the headless browser checks, runs in Docker.

## How I Used Sanity

### Content model

Eighteen schema types. The documents are `course`, `topic`, `learningObjective`, `lecture`, `slideDeck`, `book`, `bookChapter`, `assignment`, `submission`, `examScope` and `webReference`. The objects inside them are `segment`, `slide`, `bookSection`, `rubricCriterion`, `feedbackItem`, `scopedTopic` and `sourceInfo`.

Two decisions shaped everything else.

**Locators live inside the documents.** A lecture is one document with an array of segments. Each segment is two to four minutes of the caption track, with `startSec`, `endSec`, text and topic references. Slides and book sections work the same way with `number` and `pageStart`. The Knowledge Base can therefore summarise a whole lecture, while the exact second is still one GROQ projection away.

**Topics are the joins.** Segments, slides, book sections, rubric criteria and exam scope entries all reference the same twelve `topic` documents. Feedback references a rubric criterion by its `_key`. That is what turns "you mutated the input" into "rewatch lecture 5 at 35:08".

The ingest pipeline is plain TypeScript. It parses the OCW caption files (VTT) into time windows, extracts slide and book text per page from the PDFs with `unpdf`, merges hand-written metadata (topics, rubrics, exam weights, the fictional submissions), and writes each course's documents (77, 74 and 81) in one transaction with deterministic IDs. A course is one seed file of hand-authored structure; adding 6.0002 and 6.006 meant writing two seed files, not changing the pipeline, apart from optional settings for one book's page headers and one lecture without notes. One transaction mattered, because the documents reference each other and Sanity rejects a reference to a document that does not exist yet.

### Knowledge Base and Context MCP

One Knowledge Base covers all three courses: 232 documents from the `production` dataset, served through one Context MCP endpoint. Two things keep answers inside the selected course. The agent is told to use only Knowledge Base entries about that course, and every source lookup is filtered by course in GROQ, so a citation can never point into another course. A course document can also name its own endpoint, for when a course outgrows the shared Knowledge Base.

The agent connects to a Context MCP endpoint in Knowledge Base mode, with an organisation token, through `@ai-sdk/mcp`. It uses the three tools the endpoint exposes:

1. `initial_context`, once per conversation, for the Knowledge Base ID and outline.
2. `knowledge_base_search` with two to four keywords.
3. `knowledge_base_read` on the best matching entries.

The Knowledge Base explains. It does not reliably give a second or a page number, so I gave the agent four tools of its own next to the MCP ones:

- **`lookup_source`** runs GROQ over the typed arrays. It takes keywords plus an optional lecture number or topic slug, and returns segments, slides and book sections with ready-made cite strings such as `[lecture 6 @ 4:53]`. GROQ's `match` is prefix based, so I stem the keywords ("aliasing" becomes "alias") and rank results by how many keywords each one hits.
- **`weak_topics`** joins feedback to rubric criteria to topics and totals the points lost. The model reads the totals and does not compute them.
- **`exam_plan`** samples topics by exam weight, without replacement and with a seed, and attaches the learning objectives.
- **`web_search`** and **`save_web_reference`** handle the fallback. Context MCP is read-only, so saving goes through `@sanity/client` with a write token and lands as `status: pending`.

### Citations the UI can check

The agent writes citations in a fixed syntax: `[lecture 6 @ 12:40]`, `[slides 4 #5]`, `[book ch.11 p.106]`, `[assignment 3: hands]`, `[submission ps3]`. The UI parses them and resolves each one against the course's sources (video URL plus `&t=` seconds, slide deck link, book link). It also collects every cite string the tools returned in that turn. Any citation the model wrote that no tool returned gets an "unverified" badge. A malformed one, such as `[lecture 12 @ ?]`, is not parsed at all and stays plain text, so it never becomes a link to the wrong place.

### Deploy

A container Lambda running Next.js behind the Lambda Web Adapter, which streams responses. The Function URL requires IAM auth and only CloudFront can call it, through origin access control. A CloudFront Function returns 403 unless the Host header is `scholia.mol.la`, so the `cloudfront.net` and Lambda URLs both refuse direct access. Idle cost is close to zero.

Two things cost me time here. Function URLs created after October 2025 need `lambda:InvokeFunction` for CloudFront as well as `lambda:InvokeFunctionUrl`, otherwise every request is a 403. And with origin access control, a POST body has to arrive with its SHA-256 in `x-amz-content-sha256`, so the chat client hashes each request body in the browser before sending it.

### Honest notes

- **The model is the weak link.** My AWS credits only cover first-party models, so the agent runs on Amazon Nova 2 Lite. Nova Pro dropped the citation brackets, and Nova Premier had reached end of life. Early versions invented timestamps, wrote full solutions in Assignment mode, and printed all the exam questions at once. Prompting helped, but the reliable fixes are in code: cite strings come from tools and the UI checks them, Assignment mode folds any code block longer than three lines behind a "try writing this step yourself first" toggle, and points lost and exam sampling are computed in GROQ and TypeScript.
- **It did not mention the conflict.** The Knowledge Base flagged `bisect_search1`, the Study prompt says to mention conflicts, and Scholia answered O(n) without saying the slide also writes O(n log n). The answer is the right one, but a student reading that slide would be confused, and Scholia should have said why.
- **A bug I found while writing this post.** On the live site, Improve mode once spent its whole step budget on eight lookups and ended without an answer. The agent now gets ten steps, and on the last one it is told to stop looking things up and answer from what it has. Simply removing the tools on that step looked cleaner, but the Bedrock provider then also drops every earlier tool result from the request, so the answer would have lost its sources.
- **Slide text is lossy.** Many OCW slides use two columns, and PDF text extraction interleaves them (see slide 14 above). Segments from the captions are much cleaner, which is one reason lecture timestamps are the most precise citations.

## Sanity Project Details

- **Project ID:** `dqd1lxzm`
- **Dataset:** `production` (public)
- **Public query example:** https://dqd1lxzm.apicdn.sanity.io/v2026-10-01/data/query/production?query=*%5B_type%3D%3D%22lecture%22%5D%7Bnumber%2Ctitle%2C%22segments%22%3Acount(segments)%7D
- **Studio:** https://scholia.mol.la/studio

