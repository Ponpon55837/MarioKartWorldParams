/**
 * 二元堆積（Binary Heap）
 *
 * 以陣列實作的優先佇列，`compare(a, b) < 0` 代表 a 應比 b 先出堆。
 * - push / pop：O(log n)
 * - peek / size：O(1)
 *
 * 用於 Top-K（LeetCode 215 / 347）與 K 路合併（LeetCode 23 / 373）等場景。
 */
export class BinaryHeap<T> {
  private readonly items: T[] = [];
  private readonly compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.compare = compare;
  }

  get size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  push(item: T): void {
    this.items.push(item);
    this.siftUp(this.items.length - 1);
  }

  pop(): T | undefined {
    const { items } = this;
    if (items.length === 0) return undefined;

    const top = items[0];
    const last = items.pop()!;
    if (items.length > 0) {
      items[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  private siftUp(index: number): void {
    const { items, compare } = this;
    const item = items[index];

    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (compare(item, items[parent]) >= 0) break;
      items[index] = items[parent];
      index = parent;
    }
    items[index] = item;
  }

  private siftDown(index: number): void {
    const { items, compare } = this;
    const length = items.length;
    const item = items[index];

    while (true) {
      const left = index * 2 + 1;
      if (left >= length) break;

      const right = left + 1;
      const child =
        right < length && compare(items[right], items[left]) < 0 ? right : left;

      if (compare(items[child], item) >= 0) break;
      items[index] = items[child];
      index = child;
    }
    items[index] = item;
  }
}

/**
 * 取出前 K 個最佳元素（LeetCode 215 / 347 模式）
 *
 * 維護大小為 K 的「反向」堆積：堆頂永遠是目前 K 個中最差的一個，
 * 新元素只需與堆頂比較即可決定是否替換。
 * 時間 O(n log K)、空間 O(K)，K 遠小於 n 時比整體排序 O(n log n) 更省。
 *
 * @param items 候選元素
 * @param k 要取出的數量
 * @param compare `compare(a, b) < 0` 代表 a 比 b 更好（排在前面）
 * @returns 依 compare 排序後的前 K 個元素
 */
export function topK<T>(
  items: Iterable<T>,
  k: number,
  compare: (a: T, b: T) => number,
): T[] {
  if (k <= 0) return [];

  // 反向比較：最差的元素在堆頂
  const heap = new BinaryHeap<T>((a, b) => compare(b, a));

  for (const item of items) {
    if (heap.size < k) {
      heap.push(item);
    } else if (compare(item, heap.peek()!) < 0) {
      heap.pop();
      heap.push(item);
    }
  }

  const result: T[] = new Array(heap.size);
  for (let i = result.length - 1; i >= 0; i--) {
    result[i] = heap.pop()!;
  }
  return result;
}
