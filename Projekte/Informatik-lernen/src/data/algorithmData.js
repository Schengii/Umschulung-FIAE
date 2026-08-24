export const ALGORITHM_DESCRIPTIONS = {
  quicksort: {
    title: 'QuickSort (Teile und Herrsche)',
    timeComplexity: 'O(n log n) [Worst-Case: O(n²)]',
    spaceComplexity: 'O(log n)',
    description: 'Wählt ein Pivot-Element, partitioniert das Array in Elemente kleiner und größer als das Pivot und sortiert diese rekursiv.'
  },
  mergesort: {
    title: 'MergeSort (Stabiles Sortieren)',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Teilt das Array wiederholt in zwei Hälften, bis Einzel-Elemente entstehen, und führt diese geordnet zusammen (Merge).'
  },
  binary_search: {
    title: 'Binäre Suche (Binary Search)',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Halbiert den Suchraum in einem sortierten Array schrittweise, indem der Schlüssel mit dem Mittelelement verglichen wird.'
  },
  bfs: {
    title: 'Breitensuche (Breadth-First Search - BFS)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Traversiert einen Graphen ebenenweise unter Verwendung einer Warteschlange (Queue).'
  }
};
