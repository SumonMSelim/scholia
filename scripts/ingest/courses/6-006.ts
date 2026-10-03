// Curated structure for MIT 6.006. Everything derived from material (transcripts, lecture notes,
// book text, problem set text) is parsed in build.ts; this file holds what a course staff
// member would author by hand: topics, objectives, mappings, rubrics, the (fictional) student's
// submissions and feedback, and the exam scope. Only the problem set questions are ingested,
// never the published solutions.

import type {CourseSeed} from './types'

const OCW_URL = 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'

const topics = [
  ['algorithms-and-asymptotics', 'Algorithms and asymptotic analysis', 'What an algorithm is, correctness by induction, the Word-RAM model of computation, and O, Omega and Theta notation.'],
  ['sequences-and-arrays', 'Sequences, arrays and linked lists', 'The Sequence interface, static arrays, linked lists, dynamic arrays and amortized analysis.'],
  ['sets-and-sorting', 'Sets, sorting and recurrences', 'The Set interface, sorted arrays and binary search, selection, insertion and merge sort, and solving recurrences.'],
  ['hashing', 'Hashing', 'The comparison search lower bound, direct access arrays, hash tables with chaining, and universal hashing.'],
  ['linear-sorting', 'Linear-time sorting', 'Counting sort, tuple sort and radix sort for integer keys bounded by a polynomial in n.'],
  ['binary-trees-avl', 'Binary trees and AVL trees', 'Binary trees, traversal order, binary search trees, AVL balance, rotations and subtree augmentation.'],
  ['heaps-priority-queues', 'Priority queues and binary heaps', 'The priority queue interface, binary heaps stored in arrays, heapify and heap sort.'],
  ['graph-search', 'Graphs, BFS and DFS', 'Graph representations, breadth-first search, depth-first search, connected components, topological sort and cycle detection.'],
  ['shortest-paths', 'Weighted shortest paths', 'DAG relaxation, Bellman-Ford, Dijkstra, and all-pairs shortest paths with Johnson\'s algorithm.'],
  ['dynamic-programming', 'Dynamic programming', 'The SRTBOT framework, memoization, LCS, LIS, coin games, parenthesization, subset sum and pseudopolynomial time.'],
  ['complexity', 'Computational complexity', 'Decision problems, P, NP and EXP, reductions and NP-completeness.'],
] as const

type TopicId = (typeof topics)[number][0]

const objectives: [string, string, TopicId[]][] = [
  ['LO1', 'Analyse the running time of an algorithm with asymptotic notation and solve recurrences.', ['algorithms-and-asymptotics', 'sets-and-sorting']],
  ['LO2', 'Choose a data structure for a Sequence or Set interface and justify worst-case, amortized and expected bounds.', ['sequences-and-arrays', 'hashing', 'binary-trees-avl', 'heaps-priority-queues']],
  ['LO3', 'Select a sorting algorithm for a scenario, including linear-time sorts when keys are bounded integers.', ['sets-and-sorting', 'linear-sorting']],
  ['LO4', 'Augment a balanced binary search tree so it answers new queries without losing its bounds.', ['binary-trees-avl']],
  ['LO5', 'Model a problem as a graph and solve it with BFS, DFS or topological sort.', ['graph-search']],
  ['LO6', 'Choose and apply the right shortest-path algorithm for the graph and its edge weights.', ['shortest-paths']],
  ['LO7', 'Design a dynamic program with the SRTBOT framework and analyse its running time.', ['dynamic-programming']],
  ['LO8', 'Classify problems as P, NP or EXP and explain what a reduction shows.', ['complexity']],
]

const lectures: {n: number; title: string; topics: TopicId[]; resource: string; slides?: string}[] = [
  [1, 'Algorithms and Computation', ['algorithms-and-asymptotics'], 'lecture-1-algorithms-and-computation'],
  [2, 'Data Structures and Dynamic Arrays', ['sequences-and-arrays'], 'lecture-2-data-structures-and-dynamic-arrays'],
  [3, 'Sets and Sorting', ['sets-and-sorting'], 'lecture-3-sets-and-sorting'],
  [4, 'Hashing', ['hashing'], 'lecture-4-hashing'],
  [5, 'Linear Sorting', ['linear-sorting'], 'lecture-5-linear-sorting'],
  [6, 'Binary Trees, Part 1', ['binary-trees-avl'], 'lecture-6-binary-trees-part-1'],
  [7, 'Binary Trees, Part 2: AVL', ['binary-trees-avl'], 'lecture-7-binary-trees-part-2-avl'],
  [8, 'Binary Heaps', ['heaps-priority-queues'], 'lecture-8-binary-heaps'],
  [9, 'Breadth-First Search', ['graph-search'], 'lecture-9-breadth-first-search'],
  [10, 'Depth-First Search', ['graph-search'], 'lecture-10-depth-first-search'],
  [11, 'Weighted Shortest Paths', ['shortest-paths'], 'lecture-11-weighted-shortest-paths'],
  [12, 'Bellman-Ford', ['shortest-paths'], 'lecture-12-bellman-ford'],
  [13, 'Dijkstra', ['shortest-paths'], 'lecture-13-dijkstra'],
  [14, 'APSP and Johnson', ['shortest-paths'], 'lecture-14-apsp-and-johnson'],
  [15, 'Dynamic Programming, Part 1: SRTBOT, Fib, DAGs, Bowling', ['dynamic-programming'], 'lecture-15-dynamic-programming-part-1-srtbot-fib-dags-bowling'],
  [16, 'Dynamic Programming, Part 2: LCS, LIS, Coins', ['dynamic-programming'], 'lecture-16-dynamic-programming-part-2-lcs-lis-coins'],
  [17, 'Dynamic Programming, Part 3: APSP, Parens, Piano', ['dynamic-programming'], 'lecture-17-dynamic-programming-part-3-apsp-parens-piano'],
  [18, 'Dynamic Programming, Part 4: Rods, Subset Sum, Pseudopolynomial', ['dynamic-programming'], 'lecture-18-dynamic-programming-part-4-rods-subset-sum-pseudopolynomial'],
  [19, 'Complexity', ['complexity'], 'lecture-19-complexity'],
].map(([n, title, ts, resource]) => ({
  n: n as number, title: title as string, topics: ts as TopicId[], resource: resource as string,
  // OCW publishes lecture notes for every lecture except 18.
  ...(n === 18 ? {} : {slides: `mit6_006s20_lec${n}`}),
}))

type Rubric = {key: string; title: string; description: string; maxPoints: number; topics: TopicId[]}

const assignments: {n: number; title: string; resource: string; file: string; dueDate: string; topics: TopicId[]; lectures: number[]; rubric: Rubric[]}[] = [
  {
    n: 1, title: 'Problem Set 1: Asymptotics, sequences and linked lists', resource: 'mit6_006s20_ps1-questions', file: 'ps1.pdf', dueDate: '2020-02-14',
    topics: ['algorithms-and-asymptotics', 'sequences-and-arrays'], lectures: [1, 2],
    rubric: [
      {key: 'asymptotics', title: 'Problem 1-1: Asymptotic behavior of functions', description: 'Orders each set of five functions by growth and groups Theta-equivalent functions in braces, using log rules and Stirling\'s approximation correctly.', maxPoints: 2, topics: ['algorithms-and-asymptotics']},
      {key: 'seqops', title: 'Problem 1-2: reverse and move', description: 'reverse(D, i, k) and move(D, i, k, j) use only build, insert_at and delete_at, and run in O(k log n).', maxPoints: 2, topics: ['sequences-and-arrays']},
      {key: 'binder', title: 'Problem 1-3: Binder bookmarks', description: 'Database meets every stated bound for place_mark, read_page, shift_mark and move_page, and says which bounds are worst-case and which amortized.', maxPoints: 2, topics: ['sequences-and-arrays']},
      {key: 'dllist', title: 'Problem 1-4: Doubly linked list', description: 'Constant-time insert and delete at both ends, removing a node range and splicing a list, with the Python implementation passing the provided tests.', maxPoints: 4, topics: ['sequences-and-arrays']},
    ],
  },
  {
    n: 2, title: 'Problem Set 2: Recurrences and sorting', resource: 'mit6_006s20_ps2-questions', file: 'ps2.pdf', dueDate: '2020-02-21',
    topics: ['algorithms-and-asymptotics', 'sets-and-sorting'], lectures: [1, 3],
    rubric: [
      {key: 'recurrences', title: 'Problem 2-1: Solving recurrences', description: 'Tight upper and lower bounds, solved with both a recursion tree and the Master Theorem for (a) to (c), and by substitution for (d).', maxPoints: 2, topics: ['algorithms-and-asymptotics', 'sets-and-sorting']},
      {key: 'sortchoice', title: 'Problem 2-2: Sorting sorts', description: 'Chooses selection, insertion or merge sort for each scenario and justifies the choice from the cost of reads, writes and comparisons given.', maxPoints: 2, topics: ['sets-and-sorting']},
      {key: 'search', title: 'Problem 2-3: Friend Finder', description: 'Finds the position after O(log k) probes, for example by searching outward from both ends with doubling and then binary search.', maxPoints: 1, topics: ['sets-and-sorting']},
      {key: 'chat', title: 'Problem 2-4: MixBookTube.tv chat', description: 'Combines a sequence of messages with per-viewer lookups so send, recent and ban meet their worst-case bounds.', maxPoints: 1, topics: ['sets-and-sorting', 'sequences-and-arrays']},
      {key: 'bookings', title: 'Problem 2-5: Beaver Bookings', description: 'Merges two booking schedules in O(n), builds a schedule in O(n log n) by divide and conquer, and implements it in Python.', maxPoints: 4, topics: ['sets-and-sorting']},
    ],
  },
  {
    n: 3, title: 'Problem Set 3: Hashing and linear sorting', resource: 'mit6_006s20_ps3-questions', file: 'ps3.pdf', dueDate: '2020-03-06',
    topics: ['hashing', 'linear-sorting'], lectures: [4, 5],
    rubric: [
      {key: 'hashpractice', title: 'Problem 3-1: Hash practice', description: 'Draws the chained hash table after the insertions and finds the smallest c with no collisions.', maxPoints: 1, topics: ['hashing']},
      {key: 'universal', title: 'Problem 3-2: Dorm hashing', description: 'For each hash family, either shows how two IDs guarantee a collision or bounds the best achievable collision probability, using universality for (c).', maxPoints: 2, topics: ['hashing']},
      {key: 'icecores', title: 'Problem 3-3: Sorting ice cores', description: 'Picks the fastest correct sort for each key type: radix or counting sort when keys are integers bounded by a polynomial in n, comparison sort only when nothing better applies.', maxPoints: 2, topics: ['linear-sorting', 'sets-and-sorting']},
      {key: 'closepair', title: 'Problem 3-4: Pushing paper', description: 'Expected O(n) close-pair test with a hash table, and worst-case O(n) when r < n^2 using a direct access array or radix sort.', maxPoints: 1, topics: ['hashing', 'linear-sorting']},
      {key: 'anagram', title: 'Problem 3-5: Anagram archaeology', description: 'Letter-frequency tables with a sliding window update in O(1) per shift, hashing the tables for lookups, and a Python implementation within the bounds.', maxPoints: 4, topics: ['hashing']},
    ],
  },
  {
    n: 4, title: 'Problem Set 4: Binary trees, AVL trees and heaps', resource: 'mit6_006s20_ps4-questions', file: 'ps4.pdf', dueDate: '2020-03-20',
    topics: ['binary-trees-avl', 'heaps-priority-queues'], lectures: [6, 7, 8],
    rubric: [
      {key: 'avlpractice', title: 'Problem 4-1: Binary tree practice', description: 'Identifies the unbalanced nodes, performs the insertions and deletions, and draws the rotations that rebalance them.', maxPoints: 1, topics: ['binary-trees-avl']},
      {key: 'heappractice', title: 'Problem 4-2: Heap practice', description: 'Classifies each array as max-heap, min-heap or neither, and turns it into a min-heap with a correct sequence of adjacent swaps.', maxPoints: 1, topics: ['heaps-priority-queues']},
      {key: 'design', title: 'Problems 4-3 to 4-5: data structure design', description: 'Gardening Contest, Solar Supply and Robot Wrangling combine heaps, AVL trees and hash tables so every operation meets its bound, with the bound type stated.', maxPoints: 3, topics: ['binary-trees-avl', 'heaps-priority-queues', 'hashing']},
      {key: 'augmentation', title: 'Problem 4-6: Pizza optimization', description: 'Augments a Set AVL tree with subtree properties maintained in O(1) per node through rotations, and implements tastiest_slice in Python within O(n log n).', maxPoints: 5, topics: ['binary-trees-avl']},
    ],
  },
  {
    n: 5, title: 'Problem Set 5: Graphs, BFS and DFS', resource: 'mit6_006s20_ps5_questions', file: 'ps5.pdf', dueDate: '2020-04-03',
    topics: ['graph-search'], lectures: [9, 10],
    rubric: [
      {key: 'graphpractice', title: 'Problem 5-1: Graph practice', description: 'Draws the graph, writes its adjacency lists, runs BFS and DFS from A in the right order, and finds the edge whose removal leaves a DAG.', maxPoints: 2, topics: ['graph-search']},
      {key: 'modeling', title: 'Problems 5-2 to 5-5: graph modelling', description: 'Power Plants, Short-Circuitry, Ancient Avenue and Statum Quest: defines vertices and edges, picks BFS, DFS, connected components or a bipartiteness check, and states the running time in terms of the graph size.', maxPoints: 4, topics: ['graph-search']},
      {key: 'tilt', title: 'Problem 5-6: 6.006 Tilt', description: 'Models board configurations as a graph, bounds its size, uses BFS for a shortest move sequence, and implements solve_tilt in Python.', maxPoints: 4, topics: ['graph-search']},
    ],
  },
]

type Feedback = {criterionKey: string; pointsAwarded: number; severity: 'strength' | 'minor' | 'major'; comment: string}

// The student's submissions. Fictional, but the mistakes are common ones.
const submissions: {assignment: number; submittedAt: string; grade: number; content: string; overallComment: string; feedback: Feedback[]}[] = [
  {
    assignment: 2, submittedAt: '2020-02-21T21:30:00Z', grade: 6,
    content: `2-1: (a) to (c) solved with recursion trees and the Master Theorem. (d) T(n) = T(n-2) + Theta(n) answered as Theta(n log n).
2-2: (a) merge sort, "because it is O(n log n)". (b) merge sort. (c) merge sort again.
2-3: search from both ends with doubling, then binary search inside the last interval.
2-4: linked list of messages plus a hash table from viewer to that viewer's message nodes.
2-5: (a) merges the two schedules by concatenating them and re-sorting by start time. (b) divide and conquer using (a). (c) Python passes the tests.`,
    overallComment: 'Good search and data structure design. The sorting answers ignore the costs the question gives you, which is the whole point of 2-2.',
    feedback: [
      {criterionKey: 'recurrences', pointsAwarded: 1, severity: 'minor', comment: 'T(n) = T(n-2) + Theta(n) sums about n/2 linear terms, so it is Theta(n^2), not Theta(n log n). Write out the sum, as in the recurrence analysis in lecture 3.'},
      {criterionKey: 'sortchoice', pointsAwarded: 0, severity: 'major', comment: 'In (a) set_at costs Theta(n log n), so count writes, not comparisons: selection sort does O(n) swaps and wins. In (c) only log log n adjacent swaps happened, so insertion sort runs in O(n + log log n). Lecture 3 compares the three sorts by exactly these costs.'},
      {criterionKey: 'search', pointsAwarded: 1, severity: 'strength', comment: 'Searching outward from both ends with doubling is exactly right.'},
      {criterionKey: 'chat', pointsAwarded: 1, severity: 'strength', comment: 'Linked list plus per-viewer node lists meets every bound.'},
      {criterionKey: 'bookings', pointsAwarded: 3, severity: 'minor', comment: 'Re-sorting in (a) costs O(n log n), not O(n). Both schedules are already sorted by start time, so merge them the way merge sort merges two halves.'},
    ],
  },
  {
    assignment: 3, submittedAt: '2020-03-06T23:10:00Z', grade: 7,
    content: `3-1: table drawn correctly; c = 13.
3-2: (a) and (b) correct. (c) claims Rony and Tiri can still pick IDs that always collide.
3-3: (a) radix sort. (b) merge sort on ages. (c) merge sort on thickness. (d) merge sort.
3-4: (a) hash table of values seen in the last n/10 positions. (b) direct access array of size r.
3-5: rebuilds the letter-frequency table for every length-k window of A; Python passes small tests and times out on large ones.`,
    overallComment: 'You know when to hash. You do not yet spot when keys are small integers, which is when linear sorting beats comparison sorting.',
    feedback: [
      {criterionKey: 'hashpractice', pointsAwarded: 1, severity: 'strength', comment: 'Table and c are both correct.'},
      {criterionKey: 'universal', pointsAwarded: 1, severity: 'minor', comment: 'The family in (c) is the universal family from lecture 4: for any two distinct keys the collision probability is at most 1/n, whatever IDs they choose.'},
      {criterionKey: 'icecores', pointsAwarded: 1, severity: 'major', comment: 'Ages are integers below 800,000, and thickness m/n^3 becomes an integer m below 4n^3. Both are integers bounded by a polynomial in n, so radix sort sorts them in O(n). Lecture 5 builds exactly this argument: counting sort, then tuple sort, then radix sort.'},
      {criterionKey: 'closepair', pointsAwarded: 1, severity: 'strength', comment: 'Sliding hash table in (a) and the direct access array in (b) are both right.'},
      {criterionKey: 'anagram', pointsAwarded: 3, severity: 'minor', comment: 'Rebuilding each window costs O(k), so the build is O(|A|k). Update the table in O(1) per shift: add the entering letter, remove the leaving one.'},
    ],
  },
  {
    assignment: 4, submittedAt: '2020-03-20T22:45:00Z', grade: 5,
    content: `4-1 and 4-2 correct.
4-3: max-heap of scores. 4-4: farms kept in a sorted array by remaining capacity; each connection removes and reinserts a farm. 4-5: AVL tree over the matrices with subtree products.
4-6: (b) each node stores the tastiest slice in its subtree, computed when the node is inserted; rotations do not update it. (c) uses the tree as described. (d) Python recomputes the augmentation by walking the whole subtree after each insert and times out.`,
    overallComment: 'Practice problems are solid. The augmentation in 4-6 is the key idea of the set, and it has to survive rotations.',
    feedback: [
      {criterionKey: 'avlpractice', pointsAwarded: 1, severity: 'strength', comment: 'Rotations drawn correctly.'},
      {criterionKey: 'heappractice', pointsAwarded: 1, severity: 'strength', comment: 'Correct classification and swap sequences.'},
      {criterionKey: 'design', pointsAwarded: 2, severity: 'minor', comment: 'Solar Supply: reinserting into a sorted array costs O(n). Keep the farms in an AVL tree keyed by remaining capacity so each connection is O(log n).'},
      {criterionKey: 'augmentation', pointsAwarded: 1, severity: 'major', comment: 'A subtree property is only useful if every node can recompute it in O(1) from its children, and you must recompute it after each rotation, bottom-up along the path you changed. Lecture 7 shows this for subtree size and height. Walking the whole subtree makes each update O(n).'},
    ],
  },
]

const examScope = {
  _id: '6-006-examscope-final-exam',
  title: 'Final Exam',
  examDate: '2020-05-19',
  format:
    'Cumulative final covering lectures 1 to 19. A mix of short true/false questions with justification and longer problems: describe an algorithm, argue its correctness and analyse its running time.',
  topics: [
    ['algorithms-and-asymptotics', 2, 'Background for every question'],
    ['sequences-and-arrays', 2, 'Amortized bounds for dynamic arrays'],
    ['sets-and-sorting', 3, 'Merge sort and recurrences'],
    ['hashing', 3, 'Expected versus worst-case bounds'],
    ['linear-sorting', 3, 'When radix sort is linear'],
    ['binary-trees-avl', 4, 'Augmentation comes up every year'],
    ['heaps-priority-queues', 3, ''],
    ['graph-search', 4, 'Model the problem as a graph first'],
    ['shortest-paths', 5, 'Pick the algorithm from the edge weights'],
    ['dynamic-programming', 5, 'Full SRTBOT write-ups'],
    ['complexity', 2, 'Definitions and reductions only'],
  ] as [TopicId, number, string][],
  objectives: ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7', 'LO8'],
}

const chapterTopics: Record<number, TopicId[]> = {
  1: ['algorithms-and-asymptotics', 'sequences-and-arrays'],
  2: ['sequences-and-arrays'],
  3: ['sequences-and-arrays'],
  4: ['sets-and-sorting'],
  5: ['hashing'],
  6: ['binary-trees-avl'],
  7: ['binary-trees-avl'],
  8: ['binary-trees-avl'],
  9: ['binary-trees-avl'],
  10: ['heaps-priority-queues'],
  11: ['sets-and-sorting', 'linear-sorting'],
  12: ['graph-search'],
  13: ['hashing'],
  14: ['binary-trees-avl'],
}

export const seed: CourseSeed = {
  dir: '6-006',
  idPrefix: '6-006-',
  ocwUrl: OCW_URL,
  license: 'CC BY-NC-SA 4.0',
  attribution: 'MIT OpenCourseWare, 6.006 Spring 2020',
  course: {
    _id: 'course-6-006',
    title: 'Introduction to Algorithms',
    code: '6.006',
    institution: 'MIT OpenCourseWare',
    term: 'Spring 2020',
    description:
      'An introduction to mathematical modeling of computational problems, and to the common algorithms, algorithmic paradigms and data structures used to solve them. Emphasizes the relationship between algorithms and programming, and introduces basic performance measures and analysis techniques.',
  },
  topics,
  objectives,
  lectures,
  // Lecture notes repeat the course header, the instructors and "Lecture N: Title" on every page, plus the OCW footer.
  slideFurniture:
    /^(Introduction to Algorithms: 6\.006|Massachusetts Institute of Technology|Instructors: .*|\d*\s?Lecture \d+: .*|MIT OpenCourseWare|https:\/\/ocw\.mit\.edu|6\.006 Introduction to Algorithms|Spring 2020|For information about citing these materials.*)$/,
  book: {
    _id: '6-006-book-open-data-structures',
    title: 'Open Data Structures (in pseudocode)',
    authors: ['Pat Morin'],
    edition: 'Edition 0.1G beta',
    url: 'https://opendatastructures.org/',
    pdfUrl: 'https://opendatastructures.org/ods-python.pdf',
    license: 'CC BY 2.5 CA',
    attribution: 'Pat Morin, opendatastructures.org',
    pageOffset: 11,
    // Running headers are "§1.1 Section title" or "Section title §1.8"; page numbers sit on their own line.
    runningHeader: /^(§\d+\.\d+ .+|.+ §\d+\.\d+|\d{1,3})$/,
  },
  chapterTopics,
  assignments,
  submissions,
  examScope,
  starters: {
    study: ['How does universal hashing avoid long chains?', 'When is radix sort linear time?', 'What does SRTBOT stand for in dynamic programming?', 'Why does Dijkstra fail with negative edge weights?'],
    assignment: ['Help me start Problem Set 4, problem 4-6 (augmenting an AVL tree)', 'Review my approach to Problem Set 5, problem 5-6 (6.006 Tilt)'],
    improve: ['What should I improve before the final exam?'],
    revise: ['Revision sheet for dynamic programming', 'Revision sheet for shortest paths'],
    exam: ['Start a 3-question mock exam'],
  },
}
