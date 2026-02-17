import { describe, it, assert } from 'vitest';
import { Comparable, Comparator } from './compare.js';

describe('comparator/natural-order', () => {
  it('order mixed number array 1', () => {
    const data = [5, 9, 2, 7, 1, 10, 8, 4, 3, 6];
    const comparator = Comparator.naturalOrder<number>();
    const sorted = data.sort(comparator);

    assert.deepEqual(sorted, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('order mixed string array 1', () => {
    const data = ['5', '9', '2', '7', '1', '10', '8', '4', '3', '6'];
    const comparator = Comparator.naturalOrder<string>();
    const sorted = data.sort(comparator);

    assert.deepEqual(sorted, ['1', '10', '2', '3', '4', '5', '6', '7', '8', '9']);
  });

  it('order mixed boolean array 1', () => {
    const data = [true, false, true, false];
    const comparator = Comparator.naturalOrder<boolean>();
    const sorted = data.sort(comparator);

    assert.deepEqual(sorted, [true, true, false, false]);
  });
});

describe('comparator/reverse-order', () => {
  it('order mixed array 1', () => {
    const data = [5, 9, 2, 7, 1, 10, 8, 4, 3, 6];
    const comparator = Comparator.reverseOrder<number>();
    const sorted = data.sort(comparator);

    assert.deepEqual(sorted, [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('order mixed array, use natural order and reversed', () => {
    const data = [5, 9, 2, 7, 1, 10, 8, 4, 3, 6];
    const comparator = Comparator.naturalOrder<number>().reversed();

    const sorted = data.sort(comparator);

    assert.deepEqual(sorted, [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('order mixed string array 1', () => {
    const data = ['5', '9', '2', '7', '1', '10', '8', '4', '3', '6'];
    const comparator = Comparator.reverseOrder<string>();
    const sorted = data.sort(comparator);

    assert.deepEqual(sorted, ['9', '8', '7', '6', '5', '4', '3', '2', '10', '1']);
  });

  it('order mixed boolean array 1', () => {
    const data = [true, false, true, false];
    const comparator = Comparator.reverseOrder<boolean>();
    const sorted = data.sort(comparator);

    assert.deepEqual(sorted, [false, false, true, true]);
  });
});

describe('comparator/comparingThen', () => {
  const data = [
    {
      row: '1',
      number: 1,
      order: 1,
    },
    {
      row: '2',
      number: 3,
      order: 2,
    },
    {
      row: '2',
      number: 2,
      order: 3,
    },
    {
      row: '3',
      number: 3,
      order: 4,
    },
    {
      row: '3',
      number: 2,
      order: 5,
    },
  ];

  type Data = (typeof data)[number];

  it('order mixed objects, compare by keys', () => {
    const sorted = data.sort(Comparator.comparing((t) => t.number));

    assert.deepEqual(sorted, [
      {
        row: '1',
        number: 1,
        order: 1,
      },
      {
        row: '2',
        number: 2,
        order: 3,
      },
      {
        row: '3',
        number: 2,
        order: 5,
      },
      {
        row: '2',
        number: 3,
        order: 2,
      },
      {
        row: '3',
        number: 3,
        order: 4,
      },
    ]);
  });

  it('order mixed objects, compare by keys with compareThen by comparator', () => {
    const numberReverseComparator = Comparator.comparing((v: Data) => v.number).reversed();

    const sorted = data.sort(Comparator.comparing((t: Data) => t.row).thenComparing(numberReverseComparator));

    assert.deepEqual(sorted, [
      {
        row: '1',
        number: 1,
        order: 1,
      },
      {
        row: '2',
        number: 3,
        order: 2,
      },
      {
        row: '2',
        number: 2,
        order: 3,
      },
      {
        row: '3',
        number: 3,
        order: 4,
      },
      {
        row: '3',
        number: 2,
        order: 5,
      },
    ]);
  });

  it('order mixed objects, compare by keys with compareThen by key', () => {
    const sorted = data.sort(Comparator.comparing((t: Data) => t.row).thenComparing((t) => t.number));

    assert.deepEqual(sorted, [
      {
        row: '1',
        number: 1,
        order: 1,
      },
      {
        row: '2',
        number: 2,
        order: 3,
      },
      {
        row: '2',
        number: 3,
        order: 2,
      },
      {
        row: '3',
        number: 2,
        order: 5,
      },
      {
        row: '3',
        number: 3,
        order: 4,
      },
    ]);
  });

  it('order mixed objects, compare by key extractor and comparator 1', () => {
    const sorted = data.sort(
      Comparator.comparing((t: Data) => t.number).thenComparing((t) => t.order, Comparator.reverseOrder())
    );

    assert.deepEqual(sorted, [
      {
        row: '1',
        number: 1,
        order: 1,
      },
      {
        row: '3',
        number: 2,
        order: 5,
      },
      {
        row: '2',
        number: 2,
        order: 3,
      },
      {
        row: '3',
        number: 3,
        order: 4,
      },
      {
        row: '2',
        number: 3,
        order: 2,
      },
    ]);
  });

  it('order mixed objects, compare by key extractor and comparator 2', () => {
    const biasedComparator = Comparator.of<number>((a, b) => {
      if (a === 2) {
        return 1; // lowest
      }

      return a - b;
    });

    const sorted = data.sort(
      Comparator.comparing((t: Data) => t.number).thenComparing((t) => t.order, biasedComparator)
    );

    assert.deepEqual(sorted, [
      {
        row: '1',
        number: 1,
        order: 1,
      },
      {
        row: '2',
        number: 2,
        order: 3,
      },
      {
        row: '3',
        number: 2,
        order: 5,
      },
      {
        row: '3',
        number: 3,
        order: 4,
      },
      {
        row: '2',
        number: 3,
        order: 2,
      },
    ]);
  });

  it('order mixed objects, chained', () => {
    const data1 = [
      {
        row: '1',
        number: 1,
        order: 1,
      },
      {
        row: '1',
        number: 1,
        order: 2,
      },
      {
        row: '1',
        number: 2,
        order: 3,
      },
      {
        row: '1',
        number: 2,
        order: 4,
      },
      {
        row: '2',
        number: 1,
        order: 1,
      },
      {
        row: '2',
        number: 1,
        order: 2,
      },
      {
        row: '2',
        number: 2,
        order: 3,
      },
      {
        row: '2',
        number: 2,
        order: 4,
      },
    ];

    const sorted = data1.sort(
      Comparator.comparing((t: Data) => t.row)
        .reversed()
        .thenComparing((t) => t.number)
        .thenComparing((t) => t.order, Comparator.reverseOrder())
    );

    assert.deepEqual(sorted, [
      {
        row: '2',
        number: 1,
        order: 2,
      },
      {
        row: '2',
        number: 1,
        order: 1,
      },
      {
        row: '2',
        number: 2,
        order: 4,
      },
      {
        row: '2',
        number: 2,
        order: 3,
      },
      {
        row: '1',
        number: 1,
        order: 2,
      },
      {
        row: '1',
        number: 1,
        order: 1,
      },
      {
        row: '1',
        number: 2,
        order: 4,
      },
      {
        row: '1',
        number: 2,
        order: 3,
      },
    ]);
  });
});

describe('comparator/custom-comparable', () => {
    // Mock class implementing your Comparable interface
    class CustomItem implements Comparable<CustomItem> {
        constructor(public id: number, public name: string) {}

        compareTo(other: CustomItem): number {
            // Sort by ID naturally
            return this.id - other.id;
        }
    }

    it('orders objects implementing Comparable interface', () => {
        const data = [
            new CustomItem(5, 'E'),
            new CustomItem(1, 'A'),
            new CustomItem(3, 'C'),
        ];

        const comparator = Comparator.naturalOrder<CustomItem>();
        const sorted = data.sort(comparator);

        assert.deepEqual(sorted, [
            new CustomItem(1, 'A'),
            new CustomItem(3, 'C'),
            new CustomItem(5, 'E'),
        ]);
    });

    it('reverses order of objects implementing Comparable interface', () => {
        const data = [
            new CustomItem(2, 'B'),
            new CustomItem(4, 'D'),
            new CustomItem(1, 'A'),
        ];

        const comparator = Comparator.reverseOrder<CustomItem>();
        const sorted = data.sort(comparator);

        assert.deepEqual(sorted, [
            new CustomItem(4, 'D'),
            new CustomItem(2, 'B'),
            new CustomItem(1, 'A'),
        ]);
    });
});

describe('comparator/comparing-by-key-string', () => {
    it('orders objects using a string key reference', () => {
        const data = [
            { id: 3, value: 'C' },
            { id: 1, value: 'A' },
            { id: 2, value: 'B' },
        ];

        // Testing the `typeof keyOrKeyExtractor !== 'function'` branch
        const sorted = data.sort(Comparator.comparing('id'));

        assert.deepEqual(sorted, [
            { id: 1, value: 'A' },
            { id: 2, value: 'B' },
            { id: 3, value: 'C' },
        ]);
    });

    it('orders objects using a string key reference and chained comparator', () => {
        const data = [
            { type: 'fruit', qty: 5 },
            { type: 'veg', qty: 2 },
            { type: 'fruit', qty: 10 },
        ];

        const sorted = data.sort(
            Comparator.comparing<typeof data[number]>('type')
                .thenComparing(d => d.qty, Comparator.reverseOrder())
        );

        assert.deepEqual(sorted, [
            { type: 'fruit', qty: 10 },
            { type: 'fruit', qty: 5 },
            { type: 'veg', qty: 2 },
        ]);
    });
});

describe('comparator/standalone-of', () => {
    it('orders objects using a custom inline compare function', () => {
        const data = ['apple', 'banana', 'kiwi', 'strawberry'];

        // Sort by string length ascending
        const lengthComparator = Comparator.of<string>((a, b) => a.length - b.length);
        const sorted = data.sort(lengthComparator);

        assert.deepEqual(sorted, ['kiwi', 'apple', 'banana', 'strawberry']);
    });
});

describe('comparator/error-handling', () => {
    it('throws TypeError when comparing unsupported types', () => {
        const comparator = Comparator.naturalOrder<any>();

        assert.throws(() => {
            // Plain objects without a compareTo method
            comparator({ a: 1 }, { b: 2 });
        }, TypeError);
    });

    it('throws TypeError when comparing mismatched types or nulls', () => {
        const comparator = Comparator.naturalOrder<any>();

        assert.throws(() => comparator('string', 5), TypeError); // Mixed types fall through to TypeError
    });
});

describe('comparator/edge-cases-empty-single', () => {
    it('example 1: handles empty arrays safely', () => {
        const data: number[] = [];
        const sorted = data.sort(Comparator.naturalOrder<number>());
        assert.deepEqual(sorted, []);
    });

    it('example 2: handles single-element primitive arrays', () => {
        const data = ['alone'];
        const sorted = data.sort(Comparator.reverseOrder<string>());
        assert.deepEqual(sorted, ['alone']);
    });

    it('example 3: handles single-element object arrays with chained comparators', () => {
        const data = [{ id: 1, name: 'single' }];
        const sorted = data.sort(
            Comparator.comparing<typeof data[number]>('id')
                .thenComparing(d => d.name)
        );
        assert.deepEqual(sorted, [{ id: 1, name: 'single' }]);
    });
});

describe('comparator/edge-cases-identical-values', () => {
    it('example 1: handles arrays where all primitive elements are identical', () => {
        const data = [7, 7, 7, 7];
        const sorted = data.sort(Comparator.naturalOrder<number>());
        assert.deepEqual(sorted, [7, 7, 7, 7]);
    });

    it('example 2: resolves identical primary keys using secondary keys', () => {
        const data = [
            { group: 'A', value: 10, id: 1 },
            { group: 'A', value: 10, id: 2 },
            { group: 'A', value: 10, id: 3 },
        ];

        type Data = typeof data[number];

        // All primary and secondary keys are identical, relies on tertiary 'id' key
        const sorted = data.sort(
            Comparator.comparing<Data>('group')
                .thenComparing(a => a.value)
                .thenComparing(a => a.id, Comparator.reverseOrder())
        );

        assert.deepEqual(sorted, [
            { group: 'A', value: 10, id: 3 },
            { group: 'A', value: 10, id: 2 },
            { group: 'A', value: 10, id: 1 },
        ]);
    });

    it('example 3: handles identical objects without failing (returns 0)', () => {
        const obj = { category: 'test', size: 5 };
        const data = [obj, obj, obj]; // Same exact references

        const sorted = data.sort(Comparator.comparing('size'));

        assert.deepEqual(sorted, [
            { category: 'test', size: 5 },
            { category: 'test', size: 5 },
            { category: 'test', size: 5 }
        ]);
    });
});

describe('comparator/null-and-undefined', () => {
  it('sorts null and undefined to the end in natural order', () => {
    // Array with mixed primitives, null, and undefined
    const data = [3, null, 1, undefined, 2];

    const sorted = data.sort(Comparator.naturalOrder<number | null | undefined>());

    // Now both null and undefined group nicely at the end.
    // (JS handles undefined, your logic handles null).
    assert.deepEqual(sorted, [1, 2, 3, null, undefined]);
  });

  it('sorts objects with missing/undefined keys to the end', () => {
    type PartialData = { id: number; rank?: number | null };
    const data: PartialData[] = [
      { id: 1, rank: 5 },
      { id: 2 },             // rank is undefined
      { id: 3, rank: null }, // rank is null
      { id: 4, rank: 1 }
    ];

    const sorted = data.sort(Comparator.comparing<PartialData>('rank'));

    assert.deepEqual(sorted, [
      { id: 4, rank: 1 },
      { id: 1, rank: 5 },
      { id: 2 },             // Undefined goes back
      { id: 3, rank: null }  // Null goes back (stable sort preserves original relative order)
    ]);
  });

  it('sorts null to the front in reverse order, but primitive undefined stays at the end', () => {
    const data = [3, null, 1, undefined, 2];
    const sorted = data.sort(Comparator.reverseOrder<number | null | undefined>());

    // JS Native Quirk: Primitive undefined is ALWAYS forced to the end of the array,
    // ignoring the comparator. But null properly reverses to the front!
    assert.deepEqual(sorted, [null, 3, 2, 1, undefined]);
  });

  it('sorts objects with missing/undefined keys perfectly to the front in reverse order', () => {
    type PartialData = { id: number; rank?: number | null };
    const data: PartialData[] = [
      { id: 1, rank: 5 },
      { id: 2 },             // rank is undefined
      { id: 3, rank: null }, // rank is null
      { id: 4, rank: 1 }
    ];

    const sorted = data.sort(
      Comparator.comparing<PartialData>('rank', Comparator.reverseOrder())
    );

    // Because these are objects, JS doesn't force them to the end.
    // They reverse perfectly!
    assert.deepEqual(sorted, [
      { id: 2 },             // Undefined reverses to front
      { id: 3, rank: null }, // Null reverses to front
      { id: 1, rank: 5 },
      { id: 4, rank: 1 }
    ]);
  });
});