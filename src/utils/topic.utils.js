const TOPIC_ALIASES = {
  all: 'all',
  random: 'all',
  arrays: 'arrays',
  'array': 'arrays',
  strings: 'strings',
  string: 'strings',
  dp: 'dynamic programming',
  'dynamic programming': 'dynamic programming',
  'dynamic-programming': 'dynamic programming',
  trees: 'trees',
  tree: 'trees',
  graphs: 'graphs',
  graph: 'graphs',
  sorting: 'sorting',
  greedy: 'greedy',
  'binary search': 'binary search',
  'binary-search': 'binary search',
  'linked list': 'linked list',
  'linked-list': 'linked list',
  hashing: 'hashing',
  'sliding window': 'sliding window',
  'sliding-window': 'sliding window',
  'two pointers': 'two pointers',
  'two-pointers': 'two pointers',
  math: 'math',
  recursion: 'recursion',
  stack: 'stack',
  queue: 'queue',
  'bit manipulation': 'bit manipulation',
  'bit-manipulation': 'bit manipulation',
  backtracking: 'backtracking',
};

export function normalizeTopic(topic) {
  if (!topic) return 'all';
  const normalized = String(topic).trim().toLowerCase();
  return TOPIC_ALIASES[normalized] || normalized;
}
