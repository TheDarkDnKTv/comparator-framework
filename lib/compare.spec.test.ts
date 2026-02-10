import { describe, it, assert } from 'vitest';
import { Comparator } from './compare.js';

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
