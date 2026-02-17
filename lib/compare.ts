export interface Comparable<T> {
  /**
   * Compare the current object with other
   * @param other
   */
  compareTo(other: T): number;
}

export type IComparable<T> = number | boolean | string | undefined | null | Comparable<T>;

/**
 * Compare function between two objects
 * @param a
 * @param b
 * @return
 *  - 0 if a === b
 *  - value < 0 if a < b
 *  - value > 0 if a > b
 */
export type ComparatorFunction<T> = (a: T, b: T) => number;


export type IComparator<T> = ComparatorFunction<T> & {
  thenComparing(comparator: IComparator<T>): IComparator<T>;
  thenComparing<K extends IComparable<T>>(keyExtractor: (value: T) => K): IComparator<T>;
  thenComparing<K>(keyExtractor: (value: T) => K, keyComparator: IComparator<K>): IComparator<T>;
  reversed(): IComparator<T>;
  /**
   * IMPORTANT: due JS Array.sort() implementation, `undefined` will be ALWAYS at end of array
   */
  nullsFirst(): IComparator<T>;
  /**
   * IMPORTANT: due JS Array.sort() implementation, `undefined` will be ALWAYS at end of array
   */
  nullsLast(): IComparator<T>;
};

export namespace Comparator {
  export function naturalOrder<T extends IComparable<T>>(): IComparator<T> {
    return createComparator<T>((a, b) => {
      if (isNull(a) && isNull(b)) {
        return 0;
      }

      if (isNull(a)) {
        return 1;
      }

      if (isNull(b)) {
        return -1;
      }

      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }

      if (typeof a === 'boolean' && typeof b === 'boolean') {
        return a === true && b === true ? 0 : a === true ? -1 : 1;
      }

      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
      }

      if (isComparable(a)) {
        return a.compareTo(b);
      }

      throw new TypeError();
    });
  }

  export function reverseOrder<T extends IComparable<T>>(): IComparator<T> {
    const naturalComparator = naturalOrder<T>();
    return createComparator<T>((a, b) => naturalComparator(b, a));
  }

  export function comparing<T, K extends keyof T = keyof T>(
    objectKey: K,
    keyComparator?: IComparator<T[K]>
  ): IComparator<T>;
  export function comparing<T, K extends IComparable<K>>(
    keyExtractor: (value: T) => K,
    keyComparator?: IComparator<K>
  ): IComparator<T>;
  export function comparing<T, K extends IComparable<K>>(
    keyOrKeyExtractor: keyof T | ((value: T) => K),
    keyComparator?: IComparator<K>
  ): IComparator<T> {
    if (typeof keyOrKeyExtractor !== 'function') {
      const key = keyOrKeyExtractor;
      keyOrKeyExtractor = (value: any) => value[key];
    }

    return createManagedComparator(keyOrKeyExtractor, keyComparator ? keyComparator : naturalOrder());
  }

  export function of<T>(comparingFunction: ComparatorFunction<T>): IComparator<T> {
    return createComparator<T>((a, b) => comparingFunction(a, b));
  }
}

function createManagedComparator<T, K>(
  keyExtractor: (value: T) => K,
  keyComparator: IComparator<K>,
  baseComparator?: IComparator<T>
): IComparator<T> {
  return createComparator<T>((a, b) => {
    if (baseComparator) {
      const value = baseComparator(a, b);
      if (value !== 0) {
        return value;
      }
    }

    const aKey = keyExtractor(a);
    const bKey = keyExtractor(b);
    return keyComparator(aKey, bKey);
  });
}

function createComparator<T>(compareFunction: ComparatorFunction<T>): IComparator<T> {
  const comparatorFunc: any = compareFunction;
  comparatorFunc.thenComparing = function (comparatorOrKeyExtractor: unknown, keyComparator?: unknown) {
    // Pattern 3
    if (comparatorOrKeyExtractor && keyComparator) {
      const keyExtractor = comparatorOrKeyExtractor as (value: unknown) => unknown;
      const keyComp = keyComparator as IComparator<unknown>;
      return createManagedComparator(keyExtractor, keyComp, comparatorFunc);
    }

    // Pattern 2
    if (
      typeof comparatorOrKeyExtractor === 'function' &&
      (comparatorOrKeyExtractor as any).thenComparing === undefined
    ) {
      const keyExtractor = comparatorOrKeyExtractor as (value: unknown) => IComparable<unknown>;
      return createManagedComparator(keyExtractor, Comparator.naturalOrder(), comparatorFunc);
    }

    // Pattern 1
    return createComparator<T>((a, b) => {
      const value = compareFunction(a, b);
      if (value !== 0) {
        return value;
      }

      return (comparatorOrKeyExtractor as IComparator<unknown>)(a, b);
    });
  };

  comparatorFunc.reversed = function () {
    return createComparator<T>((a, b) => this(b, a));
  };

  comparatorFunc.nullsFirst = function () {
    return createComparator<T>((a, b) => {
      if (isNull(a) && isNull(b)) return 0;
      if (isNull(a)) return -1;
      if (isNull(b)) return 1;
      return comparatorFunc(a, b);
    });
  };

  comparatorFunc.nullsLast = function () {
    return createComparator<T>((a, b) => {
      if (isNull(a) && isNull(b)) return 0;
      if (isNull(a)) return 1;
      if (isNull(b)) return -1;
      return comparatorFunc(a, b);
    });
  };

  return comparatorFunc as IComparator<T>;
}

function isComparable(value: unknown): value is Comparable<any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as any).compareTo !== undefined &&
    (value as any).compareTo.length === 1
  );
}

function isNull(val: unknown): val is null | undefined {
  return val === null || typeof val === 'undefined';
}
