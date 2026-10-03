// Curated structure for MIT 6.0002. Everything derived from material (transcripts, slides,
// book text, problem set text) is parsed in build.ts; this file holds what a course staff
// member would author by hand: topics, objectives, mappings, rubrics, the (fictional) student's
// submissions and feedback, and the exam scope.

import type {CourseSeed} from './types'

const OCW_URL = 'https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/'

// Topic slugs are unique within the course; build.ts prefixes their ids with the course's idPrefix.
const topics = [
  ['optimization-and-knapsack', 'Optimization and the knapsack problem', 'Objective functions and constraints, the 0/1 knapsack problem, brute force enumeration, greedy algorithms and why they are not always optimal.'],
  ['dynamic-programming', 'Dynamic programming', 'Optimal substructure, overlapping subproblems, memoization and tabulation, decision trees for knapsack, Fibonacci.'],
  ['graph-models', 'Graph-theoretic models', 'Nodes, edges, digraphs and weighted graphs, adjacency lists, depth-first and breadth-first search, shortest paths.'],
  ['stochastic-thinking', 'Stochastic thinking', 'Causal nondeterminism, random processes, probability of independent events, simulation with random, seeding.'],
  ['random-walks-and-simulation', 'Random walks and simulation models', 'Drunkard\'s walk, Location, Field and Drunk classes, biased walks, simulating many trials and plotting the results.'],
  ['monte-carlo-simulation', 'Monte Carlo simulation', 'Law of large numbers, gambler\'s fallacy, regression to the mean, variance and standard deviation, estimating pi by simulation.'],
  ['confidence-intervals', 'Confidence intervals and distributions', 'Normal distributions, the empirical rule, probability density functions, confidence intervals, the central limit theorem.'],
  ['sampling-and-standard-error', 'Sampling and standard error', 'Random samples, sample size, standard error of the mean, estimating population statistics from one sample.'],
  ['curve-fitting', 'Experimental data and curve fitting', 'Fitting models with least squares and polyfit, the coefficient of determination R², overfitting, training and test data, cross-validation.'],
  ['machine-learning-and-clustering', 'Machine learning and clustering', 'Features and feature vectors, distance metrics, supervised vs unsupervised learning, hierarchical and k-means clustering.'],
  ['classification', 'Classification', 'Nearest neighbours, logistic regression, confusion matrices, accuracy, sensitivity, specificity, positive predictive value, ROC curves.'],
  ['statistical-sins', 'Statistical sins', 'Garbage in garbage out, misleading plots, cherry-picking, the Texas sharpshooter fallacy, extrapolation, non-representative samples.'],
] as const

type Slug = (typeof topics)[number][0]

const objectives: [string, string, Slug[]][] = [
  ['LO1', 'Formulate an optimization problem with an objective and constraints, and compare greedy, brute-force and dynamic-programming solutions.', ['optimization-and-knapsack', 'dynamic-programming']],
  ['LO2', 'Model a problem as a graph and find paths with depth-first and breadth-first search.', ['graph-models']],
  ['LO3', 'Build stochastic simulations, including random walks and Monte Carlo estimates, and interpret their results.', ['stochastic-thinking', 'random-walks-and-simulation', 'monte-carlo-simulation']],
  ['LO4', 'Quantify uncertainty with standard deviation, standard error and confidence intervals.', ['confidence-intervals', 'sampling-and-standard-error']],
  ['LO5', 'Fit models to experimental data, evaluate them with R² and held-out data, and recognise overfitting.', ['curve-fitting']],
  ['LO6', 'Apply clustering and classification, and evaluate a classifier with appropriate statistics.', ['machine-learning-and-clustering', 'classification']],
  ['LO7', 'Recognise and avoid common statistical sins when presenting data.', ['statistical-sins']],
]

const lectures: [number, string, string, Slug[]][] = [
  [1, 'Introduction and Optimization Problems', 'introduction-and-optimization-problems', ['optimization-and-knapsack']],
  [2, 'Optimization Problems', 'optimization-problems', ['optimization-and-knapsack', 'dynamic-programming']],
  [3, 'Graph-theoretic Models', 'graph-theoretic-models', ['graph-models']],
  [4, 'Stochastic Thinking', 'stochastic-thinking', ['stochastic-thinking']],
  [5, 'Random Walks', 'random-walks', ['random-walks-and-simulation']],
  [6, 'Monte Carlo Simulation', 'monte-carlo-simulation', ['monte-carlo-simulation']],
  [7, 'Confidence Intervals', 'confidence-intervals', ['confidence-intervals']],
  [8, 'Sampling and Standard Error', 'sampling-and-standard-error', ['sampling-and-standard-error', 'confidence-intervals']],
  [9, 'Understanding Experimental Data', 'understanding-experimental-data', ['curve-fitting']],
  [10, 'Understanding Experimental Data (cont.)', 'understanding-experimental-data-cont', ['curve-fitting']],
  [11, 'Introduction to Machine Learning', 'introduction-to-machine-learning', ['machine-learning-and-clustering']],
  [12, 'Clustering', 'clustering', ['machine-learning-and-clustering']],
  [13, 'Classification', 'classification', ['classification']],
  [14, 'Classification and Statistical Sins', 'classification-and-statistical-sins', ['classification', 'statistical-sins']],
  [15, 'Statistical Sins and Wrap Up', 'statistical-sins-and-wrap-up', ['statistical-sins']],
]

const chapterTopics: Record<number, Slug[]> = {
  1: ['statistical-sins'],
  2: ['stochastic-thinking'],
  3: ['stochastic-thinking'],
  4: ['stochastic-thinking'],
  5: ['confidence-intervals'],
  6: ['confidence-intervals'],
  7: ['curve-fitting'],
  8: ['sampling-and-standard-error', 'confidence-intervals'],
  9: ['monte-carlo-simulation', 'statistical-sins'],
  10: ['curve-fitting'],
  11: ['curve-fitting', 'classification'],
  12: ['curve-fitting'],
  14: ['confidence-intervals', 'sampling-and-standard-error'],
}

type Criterion = {key: string; title: string; description: string; maxPoints: number; topics: Slug[]}

const assignments: {n: number; title: string; file: string; dueDate: string; topics: Slug[]; lectures: number[]; rubric: Criterion[]}[] = [
  {
    n: 1, title: 'Problem Set 1: Space Cows Transportation', file: 'ps1/MIT6_0002F16_ProblemSet1.pdf', dueDate: '2016-10-31',
    topics: ['optimization-and-knapsack', 'dynamic-programming'], lectures: [1, 2],
    rubric: [
      {key: 'loadcows', title: 'A.1 Loading cow data', description: 'load_cows reads ps1_cow_data.txt and returns a dict mapping cow names to integer weights.', maxPoints: 1, topics: ['optimization-and-knapsack']},
      {key: 'greedy', title: 'A.2 Greedy cow transport', description: 'greedy_cow_transport always takes the heaviest cow that still fits, returns a list of trips and does not mutate the cows dict.', maxPoints: 2, topics: ['optimization-and-knapsack']},
      {key: 'bruteforce', title: 'A.3 Brute force cow transport', description: 'brute_force_cow_transport iterates over get_partitions, rejects trips over the limit and returns a partition with the fewest trips.', maxPoints: 2, topics: ['optimization-and-knapsack']},
      {key: 'dpweight', title: 'B.1 dp_make_weight', description: 'Finds the minimum number of eggs with dynamic programming (memoized recursion or tabulation); a non-DP solution scores zero.', maxPoints: 3, topics: ['dynamic-programming']},
      {key: 'analysis', title: 'A.4, A.5 and B.2: comparison and writeup', description: 'compare_cow_transport_algorithms times both algorithms with time.time; ps1_answers.pdf explains speed, optimality and why greedy can fail for eggs.', maxPoints: 2, topics: ['optimization-and-knapsack', 'dynamic-programming']},
    ],
  },
  {
    n: 2, title: 'Problem Set 2: Fastest Way to Get Around MIT', file: 'ps2/MIT6_0002F16_ProblemSet2.pdf', dueDate: '2016-11-09',
    topics: ['graph-models', 'optimization-and-knapsack'], lectures: [2, 3],
    rubric: [
      {key: 'digraph', title: 'Problem 1: WeightedEdge and Digraph', description: 'WeightedEdge stores total and outdoor distance and prints as "a->b (15, 10)"; Digraph.add_node and add_edge pass the unit tests in graph.py.', maxPoints: 2, topics: ['graph-models']},
      {key: 'loadmap', title: 'Problem 2: load_map and graph design', description: 'Design comment answers what nodes and edges represent; load_map builds the digraph from mit_map.txt; test_load_map.txt has at least 3 nodes and 3 edges.', maxPoints: 2, topics: ['graph-models']},
      {key: 'bestpath', title: 'Problem 3b: get_best_path', description: 'Recursive depth-first search that never revisits a node already on the path and prunes any path already longer than the best found so far.', maxPoints: 4, topics: ['graph-models', 'optimization-and-knapsack']},
      {key: 'directeddfs', title: 'Problem 3a and 3c: objective and directed_dfs', description: 'States the objective function and constraints; directed_dfs respects max_total_dist and max_dist_outdoors and raises ValueError when no path exists.', maxPoints: 2, topics: ['graph-models', 'optimization-and-knapsack']},
    ],
  },
  {
    n: 3, title: 'Problem Set 3: Robot Simulation', file: 'ps3/MIT6_0002F16_ProblemSet3.pdf', dueDate: '2016-11-16',
    topics: ['random-walks-and-simulation', 'stochastic-thinking', 'monte-carlo-simulation'], lectures: [4, 5, 6],
    rubric: [
      {key: 'rooms', title: 'Problems 1-2: RectangularRoom, EmptyRoom, FurnishedRoom', description: 'Rooms track dirt per tile, clean by capacity, round positions with math.floor and only report valid positions; FurnishedRoom excludes furniture tiles.', maxPoints: 2, topics: ['random-walks-and-simulation']},
      {key: 'standardrobot', title: 'Problem 3: StandardRobot', description: 'update_position_and_clean moves by speed in its direction, cleans the tile, and picks a new random direction instead of moving when blocked.', maxPoints: 3, topics: ['random-walks-and-simulation', 'stochastic-thinking']},
      {key: 'faultyrobot', title: 'Problem 4: FaultyRobot', description: 'Inherits from Robot and, with probability p from get_faulty_probability, skips cleaning and changes direction.', maxPoints: 2, topics: ['stochastic-thinking']},
      {key: 'simulation', title: 'Problems 5-6: run_simulation and plots', description: 'run_simulation averages time-steps over num_trials using robot_type, stops at min_coverage, and the plots compare robot counts and room shapes.', maxPoints: 3, topics: ['monte-carlo-simulation', 'random-walks-and-simulation']},
    ],
  },
  {
    n: 4, title: 'Problem Set 4: Simulating the Spread of Disease and Bacteria Population', file: 'ps4/MIT6_0002F16_ProblemSet4.pdf', dueDate: '2016-11-23',
    topics: ['monte-carlo-simulation', 'confidence-intervals', 'sampling-and-standard-error'], lectures: [4, 6, 7, 8],
    rubric: [
      {key: 'bacteria', title: 'Problem 1: SimpleBacteria and Patient', description: 'is_killed and reproduce use random.random against the given probabilities; Patient.update applies death, reproduction and the max population cap.', maxPoints: 2, topics: ['stochastic-thinking', 'monte-carlo-simulation']},
      {key: 'nosim', title: 'Problem 2: simulation_without_antibiotic', description: 'calc_pop_avg averages over trials; the plot of average population against time step is titled and has labelled axes.', maxPoints: 2, topics: ['monte-carlo-simulation', 'statistical-sins']},
      {key: 'ci', title: 'Problem 3: calc_pop_std and calc_95_ci', description: 'Standard deviation across trials at a time step, and a 95% interval of mean ± 1.96 × standard error (std / sqrt(number of trials)).', maxPoints: 3, topics: ['confidence-intervals', 'sampling-and-standard-error']},
      {key: 'resistant', title: 'Problems 4-5: ResistantBacteria, TreatedPatient, simulation_with_antibiotic', description: 'Resistance is inherited with mut_prob on reproduction, antibiotics kill only non-resistant bacteria, and the writeup compares simulations A and B with intervals.', maxPoints: 3, topics: ['monte-carlo-simulation', 'confidence-intervals']},
    ],
  },
  {
    n: 5, title: 'Problem Set 5: Modeling Global Warming', file: 'ps5/MIT6_0002F16_ProblemSet5.pdf', dueDate: '2016-12-07',
    topics: ['curve-fitting', 'statistical-sins'], lectures: [9, 10, 15],
    rubric: [
      {key: 'models', title: 'Part A.1-A.2: generate_models and r_squared', description: 'generate_models returns pylab.polyfit coefficients for each degree; r_squared implements 1 - SSE/total variance.', maxPoints: 3, topics: ['curve-fitting']},
      {key: 'evaluate', title: 'Part A.3-A.4: evaluate_models_on_training', description: 'Plots data points and each model with R² (and the standard error over slope ratio for linear models) in the title, labelled axes.', maxPoints: 2, topics: ['curve-fitting', 'statistical-sins']},
      {key: 'trends', title: 'Parts B-C: gen_cities_avg and moving_average', description: 'Averages yearly temperature across cities and computes a 5-year moving average, with short paragraphs on how each changes the fit.', maxPoints: 2, topics: ['curve-fitting']},
      {key: 'predict', title: 'Parts D-E: rmse, prediction and extremes', description: 'rmse is correct; models are trained on 1961-2009 and evaluated on 2010-2015; the writeup discusses overfitting and the extremes in Part E.', maxPoints: 3, topics: ['curve-fitting', 'statistical-sins']},
    ],
  },
]

const submissions: CourseSeed['submissions'] = [
  {
    assignment: 2, submittedAt: '2016-11-09T23:30:00Z', grade: 6,
    content: `graph.py: WeightedEdge and Digraph complete, unit tests pass.
ps2.py: load_map works on mit_map.txt; the Problem 2a design comment is empty and test_load_map.txt has two edges. get_best_path loops over the children of start and recurses, using a module-level visited set to avoid cycles; it never compares the current path's distance with best_dist. directed_dfs returns None when no path is found.`,
    overallComment: 'The graph classes are clean. The search finds paths on the first query but is slow, and the visited set breaks every later query.',
    feedback: [
      {criterionKey: 'digraph', pointsAwarded: 2, severity: 'strength', comment: 'WeightedEdge.__str__ and the Digraph methods are correct and tidy.'},
      {criterionKey: 'loadmap', pointsAwarded: 1, severity: 'minor', comment: 'load_map is right, but the design comment is blank and the test file needs at least 3 nodes and 3 edges.'},
      {criterionKey: 'bestpath', pointsAwarded: 2, severity: 'major', comment: 'Two problems. The global visited set is never reset, so the second directed_dfs call cannot visit nodes the first call saw; check "node not in path" instead, as the DFS in lecture 3 does. And there is no pruning: once a partial path is longer than the best so far, stop extending it. The spec makes that optimisation part of full credit.'},
      {criterionKey: 'directeddfs', pointsAwarded: 1, severity: 'minor', comment: 'When no path satisfies the constraints the spec asks for a ValueError, not None.'},
    ],
  },
  {
    assignment: 4, submittedAt: '2016-11-24T01:05:00Z', grade: 6,
    content: `ps4.py: SimpleBacteria and Patient follow the docstrings. simulation_without_antibiotic averages 100 trials and plots population over 300 steps with no title or axis labels. calc_95_ci returns (mean, 1.96 * calc_pop_std(...)). TreatedPatient.update kills resistant and non-resistant bacteria alike once the antibiotic is on.
ps4_writeup.pdf: reports the intervals at step 299 and concludes the two simulations "might be the same" because the intervals overlap heavily.`,
    overallComment: 'The simulation is sound. The interval is the wrong width, and that changes your conclusion.',
    feedback: [
      {criterionKey: 'bacteria', pointsAwarded: 2, severity: 'strength', comment: 'Probabilistic death and reproduction are implemented exactly as specified.'},
      {criterionKey: 'nosim', pointsAwarded: 1, severity: 'minor', comment: 'The plot has no title and no axis labels. Lecture 15 on statistical sins: a reader cannot tell what is being shown.'},
      {criterionKey: 'ci', pointsAwarded: 1, severity: 'major', comment: 'A 95% confidence interval for the mean uses the standard error, std / sqrt(n), not the standard deviation of the trials. Your intervals are 10 times too wide for 100 trials, which is why they overlap. Revisit lecture 8 on sampling and standard error, and lecture 7 on the empirical rule.'},
      {criterionKey: 'resistant', pointsAwarded: 2, severity: 'minor', comment: 'Antibiotics should only kill bacteria that are not resistant; check get_resistant() before removing a bacterium.'},
    ],
  },
  {
    assignment: 5, submittedAt: '2016-12-07T22:10:00Z', grade: 7,
    content: `ps5.py: generate_models and r_squared correct. evaluate_models_on_training plots each model with R² in the title but omits the standard error over slope ratio for the linear model. gen_cities_avg and moving_average correct. For Part D the student picks the degree-20 model "because it has the highest R²" and reports RMSE computed on the 1961-2009 training years.`,
    overallComment: 'Good implementation. The prediction section draws the wrong lesson from the numbers: it rewards overfitting.',
    feedback: [
      {criterionKey: 'models', pointsAwarded: 3, severity: 'strength', comment: 'polyfit usage and R² are correct.'},
      {criterionKey: 'evaluate', pointsAwarded: 1, severity: 'minor', comment: 'For linear models the title must also show the ratio of the standard error to the slope, which tells you whether the trend could be chance.'},
      {criterionKey: 'trends', pointsAwarded: 2, severity: 'strength', comment: 'The moving average and the multi-city average are right, and the paragraphs explain the smoother fit well.'},
      {criterionKey: 'predict', pointsAwarded: 1, severity: 'major', comment: 'A degree-20 model will always fit the training years best. That is overfitting, not a better model. Evaluate RMSE on the 2010-2015 test years, as lecture 10 does with training and test sets and cross-validation, and compare the degrees there.'},
    ],
  },
]

export const seed: CourseSeed = {
  dir: '6-0002',
  idPrefix: '6-0002-',
  ocwUrl: OCW_URL,
  license: 'CC BY-NC-SA 4.0',
  attribution: 'MIT OpenCourseWare, 6.0002 Fall 2016',
  course: {
    _id: 'course-6-0002',
    title: 'Introduction to Computational Thinking and Data Science',
    code: '6.0002',
    institution: 'MIT OpenCourseWare',
    term: 'Fall 2016',
    description:
      'The continuation of 6.0001 for students with little or no programming experience. Uses Python to model problems with optimization, graphs and simulation, and to reason about data with statistics, curve fitting and machine learning.',
  },
  topics,
  objectives,
  lectures: lectures.map(([n, title, slug, ts]) => ({n, title, topics: ts, resource: `lecture-${n}-${slug}`, slides: `mit6_0002f16_lec${n}`})),
  slideFurniture: /^6\.0002 LECTURE \d+\b.{0,12}$/i,
  book: {
    _id: '6-0002-book-think-stats-2e',
    title: 'Think Stats: Exploratory Data Analysis in Python',
    authors: ['Allen B. Downey'],
    edition: '2nd edition, version 2.2.0',
    url: 'https://greenteapress.com/wp/think-stats-2e/',
    pdfUrl: 'https://greenteapress.com/thinkstats2/thinkstats2.pdf',
    license: 'CC BY-NC-SA 4.0',
    attribution: 'Allen B. Downey, Green Tea Press',
    pageOffset: 19,
  },
  chapterTopics,
  assignments: assignments.map((a) => ({...a, resource: `ps${a.n}`})),
  submissions,
  examScope: {
    _id: '6-0002-examscope-final-exam',
    title: 'Final Exam',
    examDate: '2016-12-19',
    format:
      'Open book and printed notes, no internet and no computer. Short-answer, code-reading and short code-writing questions across lectures 1 to 15, with emphasis on simulation, statistics and model fitting.',
    topics: [
      ['optimization-and-knapsack', 4, 'Greedy vs optimal, formulate objective and constraints'],
      ['dynamic-programming', 4, 'Spot optimal substructure and overlapping subproblems'],
      ['graph-models', 4, 'Trace DFS and BFS by hand'],
      ['stochastic-thinking', 3, 'Probabilities of independent events'],
      ['random-walks-and-simulation', 3, ''],
      ['monte-carlo-simulation', 4, 'Law of large numbers vs gambler\'s fallacy'],
      ['confidence-intervals', 5, 'Empirical rule and interpreting an interval'],
      ['sampling-and-standard-error', 4, 'Standard error from one sample'],
      ['curve-fitting', 5, 'R², overfitting, training vs test data'],
      ['machine-learning-and-clustering', 3, 'k-means steps'],
      ['classification', 4, 'Sensitivity, specificity and PPV from a confusion matrix'],
      ['statistical-sins', 3, 'Name the sin in a given plot or claim'],
    ],
    objectives: ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7'],
  },
  starters: {
    study: [
      'Why does a greedy algorithm not always solve the knapsack problem optimally?',
      'How does memoization make the recursive Fibonacci fast?',
      'What does the standard error of the mean tell me?',
      'How does k-means clustering work?',
    ],
    assignment: ['Help me start Problem Set 1 part B (dp_make_weight) without giving me the answer', 'Review my plan for get_best_path in Problem Set 2'],
    improve: ['What should I improve before the final exam?'],
    revise: ['Revision sheet for confidence intervals and standard error', 'Revision sheet for the whole final exam scope'],
    exam: ['Start a 3-question mock exam'],
  },
}
