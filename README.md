# comparator-framework

An easy to use chainable lightweight comparator util library inspired by Java Comparators

Motivation behind creating this package been in annoyance of writing own comparators each time I need to sort an array of complex objects,
moreover that complicates with each of nested comparison you need.

### Some basic use

```typescript
const data = [6, 2, 7, 1, 5];

data.sort(Comparator.naturalOrder())
// [7, 6, 5, 2, 1]

data.sort(Comparator.reverseOrder())
// [1, 2, 5, 6, 7]
```

### Object sorting
```typescript
const data = [
  {
    id: 3
  },
  {
    id: 5
  },
  {
    id: 1
  }
];

data.sort(Comparator.comparing('id'))
// [7, 6, 5, 2, 1]

// OR
data.sort(Comparator.comparing(o => o.id))
```

### Complex chaining
```typescript
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
```

### Sort by `IComparable<T>` implementation
```typescript
class CustomItem implements Comparable<CustomItem> {
  constructor(public id: number, public name: string) {}

  compareTo(other: CustomItem): number {
    // Sort by ID naturally
    return this.id - other.id;
  }
}

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
```
