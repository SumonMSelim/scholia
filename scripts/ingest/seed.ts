// Curated structure for the demo course. Everything derived from material (transcripts, slides,
// book text, problem set text) is parsed in build.ts; this file holds what a course staff
// member would author by hand: topics, objectives, mappings, rubrics, the (fictional) student's
// submissions and feedback, and the exam scope.

export const LICENSE_OCW = 'CC BY-NC-SA 4.0'
export const OCW_URL =
  'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/'

export const course = {
  _id: 'course-6-0001',
  title: 'Introduction to Computer Science and Programming in Python',
  code: '6.0001',
  institution: 'MIT OpenCourseWare',
  term: 'Fall 2016',
  description:
    'Intended for students with little or no programming experience. Provides an understanding of the role computation can play in solving problems, and helps students feel confident writing small programs in Python 3.',
}

// Topic ids double as slugs. Order follows the lecture sequence.
export const topics = [
  ['computation-and-python-basics', 'Computation and Python basics', 'What a program is, the interpreter, objects, types, expressions, variables and assignment.'],
  ['branching-and-iteration', 'Branching and iteration', 'Conditionals (if/elif/else), while and for loops, loop termination, range, break.'],
  ['strings-guess-and-check-bisection', 'Strings, guess-and-check, bisection', 'String indexing and slicing, exhaustive enumeration, approximation with a tolerance, bisection search.'],
  ['functions-and-abstraction', 'Functions and abstraction', 'Decomposition, abstraction, function definitions, specifications (docstrings), return vs print, scope and environments.'],
  ['tuples-lists-mutability', 'Tuples, lists and mutability', 'Tuples, lists, aliasing, mutability, cloning, list methods and their side effects.'],
  ['recursion', 'Recursion', 'Base cases and recursive steps, induction, towers of Hanoi, Fibonacci, palindromes, recursion vs iteration.'],
  ['dictionaries', 'Dictionaries', 'Key/value storage, lookups, iteration over dicts, memoization with a dictionary.'],
  ['testing-debugging-exceptions', 'Testing, debugging and exceptions', 'Unit and black-box testing, debugging strategies, try/except, raising exceptions, assertions as contracts.'],
  ['object-oriented-programming', 'Object-oriented programming', 'Classes as abstract data types, __init__, attributes, methods, __str__, self.'],
  ['classes-and-inheritance', 'Classes and inheritance', 'Class hierarchies, subclasses, overriding methods, super(), class variables vs instance variables.'],
  ['program-efficiency-big-o', 'Program efficiency and Big-O', 'Measuring time, counting operations, orders of growth, Big-O notation, constant, log, linear, quadratic and exponential complexity.'],
  ['searching-and-sorting', 'Searching and sorting', 'Linear and bisection search, bubble, selection and merge sort, and their complexity.'],
] as const

export type TopicId = (typeof topics)[number][0]
export const topicRef = (id: TopicId) => ({_type: 'reference', _ref: `topic-${id}`})

export const objectives: [string, string, TopicId[]][] = [
  ['LO1', 'Explain what a program is and how the Python interpreter evaluates expressions and statements.', ['computation-and-python-basics']],
  ['LO2', 'Write programs that use branching and iteration correctly, including guaranteed loop termination.', ['branching-and-iteration']],
  ['LO3', 'Apply guess-and-check, approximation and bisection search to numeric problems.', ['strings-guess-and-check-bisection']],
  ['LO4', 'Decompose a problem into functions with clear specifications, and reason about scope.', ['functions-and-abstraction']],
  ['LO5', 'Choose between tuples, lists and dictionaries, and predict the effects of aliasing and mutation.', ['tuples-lists-mutability', 'dictionaries']],
  ['LO6', 'Write and trace recursive functions with correct base cases.', ['recursion']],
  ['LO7', 'Test and debug programs systematically, and use exceptions and assertions appropriately.', ['testing-debugging-exceptions']],
  ['LO8', 'Design classes with attributes and methods, and use inheritance to share behaviour.', ['object-oriented-programming', 'classes-and-inheritance']],
  ['LO9', 'Analyse the order of growth of a program with Big-O and choose a suitable search or sort algorithm.', ['program-efficiency-big-o', 'searching-and-sorting']],
]

export const lectures: {n: number; title: string; topics: TopicId[]}[] = [
  {n: 1, title: 'What is Computation?', topics: ['computation-and-python-basics']},
  {n: 2, title: 'Branching and Iteration', topics: ['branching-and-iteration']},
  {n: 3, title: 'String Manipulation, Guess and Check, Approximations, Bisection', topics: ['strings-guess-and-check-bisection']},
  {n: 4, title: 'Decomposition, Abstraction, and Functions', topics: ['functions-and-abstraction']},
  {n: 5, title: 'Tuples, Lists, Aliasing, Mutability, and Cloning', topics: ['tuples-lists-mutability']},
  {n: 6, title: 'Recursion and Dictionaries', topics: ['recursion', 'dictionaries']},
  {n: 7, title: 'Testing, Debugging, Exceptions, and Assertions', topics: ['testing-debugging-exceptions']},
  {n: 8, title: 'Object Oriented Programming', topics: ['object-oriented-programming']},
  {n: 9, title: 'Python Classes and Inheritance', topics: ['classes-and-inheritance']},
  {n: 10, title: 'Understanding Program Efficiency, Part 1', topics: ['program-efficiency-big-o']},
  {n: 11, title: 'Understanding Program Efficiency, Part 2', topics: ['program-efficiency-big-o']},
  {n: 12, title: 'Searching and Sorting', topics: ['searching-and-sorting']},
]

export const book = {
  _id: 'book-think-python-2e',
  title: 'Think Python: How to Think Like a Computer Scientist',
  authors: ['Allen B. Downey'],
  edition: '2nd edition, version 2.4.0',
  url: 'https://greenteapress.com/wp/think-python-2e/',
  license: 'CC BY-NC 3.0',
  attribution: 'Allen B. Downey, Green Tea Press',
  // PDF page index minus this offset = printed page number
  pageOffset: 21,
}

export const chapterTopics: Record<number, TopicId[]> = {
  1: ['computation-and-python-basics'],
  2: ['computation-and-python-basics'],
  3: ['functions-and-abstraction'],
  4: ['functions-and-abstraction'],
  5: ['branching-and-iteration', 'recursion'],
  6: ['functions-and-abstraction', 'recursion'],
  7: ['branching-and-iteration', 'strings-guess-and-check-bisection'],
  8: ['strings-guess-and-check-bisection'],
  9: ['strings-guess-and-check-bisection'],
  10: ['tuples-lists-mutability'],
  11: ['dictionaries'],
  12: ['tuples-lists-mutability'],
  13: ['dictionaries', 'program-efficiency-big-o'],
  14: ['testing-debugging-exceptions'],
  15: ['object-oriented-programming'],
  16: ['object-oriented-programming'],
  17: ['object-oriented-programming'],
  18: ['classes-and-inheritance'],
  19: ['tuples-lists-mutability', 'dictionaries'],
}

export type Rubric = {key: string; title: string; description: string; maxPoints: number; topics: TopicId[]}

export const assignments: {
  n: number
  title: string
  file: string
  dueDate: string
  topics: TopicId[]
  lectures: number[]
  rubric: Rubric[]
}[] = [
  {
    n: 0, title: 'Problem Set 0: Getting started', file: 'ps0/MIT6_0001F16_ProblemSet0.pdf', dueDate: '2016-09-13',
    topics: ['computation-and-python-basics'], lectures: [1],
    rubric: [
      {key: 'runs', title: 'Program runs', description: 'ps0.py runs without errors in Python 3.5.', maxPoints: 4, topics: ['computation-and-python-basics']},
      {key: 'input', title: 'Input handling', description: 'Reads two integers from the user with input() and converts them with int().', maxPoints: 3, topics: ['computation-and-python-basics']},
      {key: 'output', title: 'Correct output', description: 'Prints x**y and log2(x) with the exact wording asked for.', maxPoints: 3, topics: ['computation-and-python-basics']},
    ],
  },
  {
    n: 1, title: 'Problem Set 1: House hunting', file: 'ps1.pdf', dueDate: '2016-09-20',
    topics: ['branching-and-iteration', 'strings-guess-and-check-bisection'], lectures: [2, 3],
    rubric: [
      {key: 'parta', title: 'Part A: months to save', description: 'Loop accumulates savings with monthly return and stops when the down payment is reached; correct month count.', maxPoints: 3, topics: ['branching-and-iteration']},
      {key: 'partb', title: 'Part B: semi-annual raise', description: 'Salary rises every 6 months, applied at the right month boundary.', maxPoints: 3, topics: ['branching-and-iteration']},
      {key: 'partc', title: 'Part C: bisection search for savings rate', description: 'Bisection over integer rate 0..10000, converges within 36 months and $100, reports steps, handles the impossible case.', maxPoints: 3, topics: ['strings-guess-and-check-bisection']},
      {key: 'style', title: 'Style and clarity', description: 'Clear variable names, comments where needed, no magic numbers.', maxPoints: 1, topics: ['functions-and-abstraction']},
    ],
  },
  {
    n: 2, title: 'Problem Set 2: Hangman', file: 'ps2/MIT6_0001F16_Pset2.pdf', dueDate: '2016-09-27',
    topics: ['functions-and-abstraction', 'strings-guess-and-check-bisection', 'branching-and-iteration'], lectures: [3, 4],
    rubric: [
      {key: 'helpers', title: 'Helper functions', description: 'is_word_guessed, get_guessed_word and get_available_letters each do one thing and match their specifications.', maxPoints: 3, topics: ['functions-and-abstraction']},
      {key: 'gameloop', title: 'Game loop', description: 'hangman() tracks guesses and warnings correctly and terminates when the word is guessed or guesses run out.', maxPoints: 3, topics: ['branching-and-iteration']},
      {key: 'strings', title: 'String handling', description: 'Guessed word built with string operations; vowels cost two guesses; input validated with str.isalpha and lower-cased.', maxPoints: 2, topics: ['strings-guess-and-check-bisection']},
      {key: 'hints', title: 'Hints (match_with_gaps, show_possible_matches)', description: 'Hint functions compare against the word list without false positives.', maxPoints: 2, topics: ['strings-guess-and-check-bisection', 'functions-and-abstraction']},
    ],
  },
  {
    n: 3, title: 'Problem Set 3: The 6.0001 word game', file: 'ps3/MIT6_0001F16_ProblemSet3.pdf', dueDate: '2016-10-05',
    topics: ['dictionaries', 'tuples-lists-mutability', 'testing-debugging-exceptions'], lectures: [5, 6, 7],
    rubric: [
      {key: 'scoring', title: 'Word scores', description: 'get_word_score follows the formula, including the bonus for using all letters.', maxPoints: 2, topics: ['dictionaries']},
      {key: 'hands', title: 'Dealing and updating hands', description: 'deal_hand and update_hand use dictionaries correctly; update_hand must not mutate the input hand.', maxPoints: 3, topics: ['dictionaries', 'tuples-lists-mutability']},
      {key: 'validity', title: 'Valid words and wildcards', description: 'is_valid_word checks the word list and letter availability, including the wildcard rule.', maxPoints: 2, topics: ['dictionaries']},
      {key: 'play', title: 'Playing a hand and a game', description: 'play_hand and play_game follow the flow in the spec; replay and substitution options work.', maxPoints: 2, topics: ['branching-and-iteration']},
      {key: 'tests', title: 'Passes provided tests', description: 'test_ps3.py passes; failures diagnosed and fixed.', maxPoints: 1, topics: ['testing-debugging-exceptions']},
    ],
  },
  {
    n: 4, title: 'Problem Set 4: Permutations and ciphers', file: 'ps4/MIT6_0001F16_Pset4.pdf', dueDate: '2016-10-12',
    topics: ['recursion', 'object-oriented-programming', 'classes-and-inheritance'], lectures: [6, 8, 9],
    rubric: [
      {key: 'perms', title: 'Part A: recursive permutations', description: 'get_permutations is recursive with a correct base case and returns all permutations exactly once.', maxPoints: 3, topics: ['recursion']},
      {key: 'message', title: 'Message class', description: 'Message stores text and valid words; build_shift_dict builds a correct shifted mapping for both cases.', maxPoints: 2, topics: ['object-oriented-programming']},
      {key: 'subclasses', title: 'PlaintextMessage and CiphertextMessage', description: 'Subclasses call the parent constructor via Message.__init__, keep attributes private with getters, and decrypt_message picks the best shift.', maxPoints: 3, topics: ['classes-and-inheritance']},
      {key: 'subcipher', title: 'Part C: substitution cipher', description: 'SubMessage and EncryptedSubMessage use the vowel permutation correctly; decrypt tries all permutations.', maxPoints: 2, topics: ['recursion', 'classes-and-inheritance']},
    ],
  },
  {
    n: 5, title: 'Problem Set 5: RSS feed filter', file: 'ps5/MIT6_0001F16_ps5.pdf', dueDate: '2016-10-19',
    topics: ['classes-and-inheritance', 'object-oriented-programming', 'testing-debugging-exceptions'], lectures: [8, 9],
    rubric: [
      {key: 'newsstory', title: 'NewsStory class', description: 'Stores guid, title, description, link and pubdate with getters.', maxPoints: 2, topics: ['object-oriented-programming']},
      {key: 'triggers', title: 'Trigger hierarchy', description: 'PhraseTrigger, TitleTrigger, DescriptionTrigger, TimeTrigger, BeforeTrigger and AfterTrigger use inheritance without duplicating code.', maxPoints: 4, topics: ['classes-and-inheritance']},
      {key: 'composite', title: 'Composite triggers', description: 'NotTrigger, AndTrigger and OrTrigger compose other triggers.', maxPoints: 2, topics: ['classes-and-inheritance']},
      {key: 'filter', title: 'Filtering and trigger file', description: 'filter_stories returns matching stories; read_trigger_config parses triggers.txt and handles malformed lines.', maxPoints: 2, topics: ['testing-debugging-exceptions']},
    ],
  },
]

// The student's submissions. Fictional, but the mistakes are the ones this course's TAs see
// every year. Feedback items point at rubric keys; rubric criteria point at topics.
export type Feedback = {criterionKey: string; pointsAwarded: number; severity: 'strength' | 'minor' | 'major'; comment: string}

export const submissions: {
  assignment: number
  submittedAt: string
  grade: number
  content: string
  overallComment: string
  feedback: Feedback[]
}[] = [
  {
    assignment: 1, submittedAt: '2016-09-20T22:41:00Z', grade: 8,
    content: `ps1a.py: while loop adds annual_salary*portion_saved/12 plus current_savings*r/12 each month until current_savings >= portion_down_payment.
ps1b.py: same loop, with "if months % 6 == 0: annual_salary *= (1 + semi_annual_raise)" placed before the deposit.
ps1c.py: bisection over low=0, high=10000 with guess = (low+high)//2; loop "while abs(savings - 250000) > 100"; prints best rate and steps.`,
    overallComment: 'Solid control flow. Part C needs the impossible-case guard and the raise timing is off by one month.',
    feedback: [
      {criterionKey: 'parta', pointsAwarded: 3, severity: 'strength', comment: 'Loop and accumulation are correct and readable.'},
      {criterionKey: 'partb', pointsAwarded: 2, severity: 'minor', comment: 'Raise is applied in month 6 before that month\'s deposit, so it is one month early. Check months_so_far after incrementing, as in lecture 2\'s loop pattern.'},
      {criterionKey: 'partc', pointsAwarded: 2, severity: 'minor', comment: 'Bisection converges, but when even 100% savings is not enough the loop never ends. Add the "not possible" check before searching, and remember the tolerance check compares the final savings, not the rate.'},
      {criterionKey: 'style', pointsAwarded: 1, severity: 'strength', comment: 'Named constants for the down payment fraction and return rate. Nice.'},
    ],
  },
  {
    assignment: 2, submittedAt: '2016-09-28T03:12:00Z', grade: 6,
    content: `hangman.py: hangman(secret_word) is one 90-line function. Letter checks and the guessed-word display are inlined instead of calling get_guessed_word and get_available_letters. Warnings counter starts at 3 and decrements, but when it reaches 0 a further invalid input does not reduce guesses_remaining. Vowels cost one guess. match_with_gaps compares lengths but not letters in the non-gap positions. Code was handed in one day late.`,
    overallComment: 'The game mostly works, but you rewrote the helpers inside hangman() instead of using them, which is where most of the bugs come from.',
    feedback: [
      {criterionKey: 'helpers', pointsAwarded: 1, severity: 'major', comment: 'get_guessed_word and get_available_letters are defined but never called; their logic is duplicated inside hangman() with small differences. Lecture 4 covers why decomposition matters: one place to fix, one place to test. Write the helper to its spec, test it alone, then call it.'},
      {criterionKey: 'gameloop', pointsAwarded: 2, severity: 'minor', comment: 'When warnings hit zero, further invalid input should cost a guess. Your branch never updates guesses_remaining in that case.'},
      {criterionKey: 'strings', pointsAwarded: 1, severity: 'minor', comment: 'Vowel guesses should cost two guesses. Use "if letter in \'aeiou\'" as in the spec.'},
      {criterionKey: 'hints', pointsAwarded: 2, severity: 'strength', comment: 'show_possible_matches prints the right words for the test cases, though match_with_gaps only compares lengths and gets lucky with the provided list.'},
    ],
  },
  {
    assignment: 3, submittedAt: '2016-10-05T23:58:00Z', grade: 7,
    content: `ps3.py: get_word_score correct. update_hand does "new_hand = hand" then decrements counts, so the caller's hand is modified too. is_valid_word handles the wildcard by trying every vowel. play_hand and play_game follow the spec. Two tests in test_ps3.py fail (test_update_hand), both because the original hand is mutated.`,
    overallComment: 'Good grasp of dictionaries. The one real bug is aliasing: new_hand = hand does not copy anything.',
    feedback: [
      {criterionKey: 'scoring', pointsAwarded: 2, severity: 'strength', comment: 'Formula and the all-letters bonus are right.'},
      {criterionKey: 'hands', pointsAwarded: 1, severity: 'major', comment: 'new_hand = hand creates an alias, not a copy, so update_hand mutates the input. Use hand.copy() (lecture 5 on aliasing and cloning). The spec says the input hand must not be modified; the failing tests told you this.'},
      {criterionKey: 'validity', pointsAwarded: 2, severity: 'strength', comment: 'Wildcard handling is correct and clearly written.'},
      {criterionKey: 'play', pointsAwarded: 2, severity: 'strength', comment: 'Game flow matches the spec.'},
      {criterionKey: 'tests', pointsAwarded: 0, severity: 'minor', comment: 'Two provided tests fail. Read the failing test\'s message: it compares the hand before and after the call, which points straight at the aliasing bug. Run the tests before handing in.'},
    ],
  },
  {
    assignment: 4, submittedAt: '2016-10-13T01:20:00Z', grade: 5,
    content: `ps4a.py: get_permutations(sequence) recurses on sequence[1:] and inserts sequence[0] at every position, but the base case is "if len(sequence) == 0: return []", so every result list is empty.
ps4b.py: PlaintextMessage.__init__ sets self.message_text and self.valid_words directly instead of calling Message.__init__; apply_shift works. CiphertextMessage.decrypt_message loops over shifts 1..25 and returns the first shift with any valid word rather than the maximum count.
ps4c.py: SubMessage done; EncryptedSubMessage.decrypt_message not attempted.`,
    overallComment: 'The recursive structure is right but the base case is wrong, and the class hierarchy skips the parent constructor. Both are worth revisiting before the final quiz.',
    feedback: [
      {criterionKey: 'perms', pointsAwarded: 1, severity: 'major', comment: 'Base case must return [sequence] (or [\'\']) for a single character, not []. Trace the call on "ab" by hand as in lecture 6: the recursive step inserts into every list the base case returns, and an empty list has nothing to insert into.'},
      {criterionKey: 'message', pointsAwarded: 2, severity: 'strength', comment: 'build_shift_dict handles upper and lower case correctly.'},
      {criterionKey: 'subclasses', pointsAwarded: 1, severity: 'major', comment: 'Subclasses should call Message.__init__(self, text) so the parent sets up state once (lecture 9). Setting the attributes yourself breaks when the parent changes. decrypt_message must pick the shift that maximises valid words, not the first that has one.'},
      {criterionKey: 'subcipher', pointsAwarded: 1, severity: 'minor', comment: 'SubMessage is fine. EncryptedSubMessage.decrypt_message needs get_permutations on the vowels and a best-count comparison, same pattern as Part B.'},
    ],
  },
]

export const examScope = {
  _id: 'examscope-final-quiz',
  title: 'Final Quiz',
  examDate: '2016-10-26',
  format:
    '90 minutes, closed book, two pages of notes allowed. About 3 code-writing questions, 5 trace-the-code questions and 5 short-answer questions. Covers lectures 1 to 12 with emphasis on material after the midterm.',
  topics: [
    ['computation-and-python-basics', 1, 'Only as background'],
    ['branching-and-iteration', 2, ''],
    ['strings-guess-and-check-bisection', 3, 'Bisection search will be asked'],
    ['functions-and-abstraction', 4, 'Scope and environment diagrams'],
    ['tuples-lists-mutability', 4, 'Aliasing traces are a favourite'],
    ['recursion', 5, 'Write and trace; no proofs by induction'],
    ['dictionaries', 3, ''],
    ['testing-debugging-exceptions', 2, 'try/except and assert'],
    ['object-oriented-programming', 4, ''],
    ['classes-and-inheritance', 5, 'Method resolution and super calls'],
    ['program-efficiency-big-o', 4, 'Classify code by order of growth'],
    ['searching-and-sorting', 4, 'Compare algorithms by complexity'],
  ] as [TopicId, number, string][],
  objectives: ['LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7', 'LO8', 'LO9'],
}
