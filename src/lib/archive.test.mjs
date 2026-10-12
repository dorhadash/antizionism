import test from 'node:test';
import assert from 'node:assert/strict';
import { filterEntries, closestEntry, summarize } from './archive.mjs';
const entries = [
  { exampleId: 'a', date: '2023-10-07', claimIds: ['1'], text: 'Alpha evidence' },
  { exampleId: 'b', date: '2023-10-07', claimIds: ['2'], text: 'Beta evidence' },
  { exampleId: 'c', date: '2023-11-01', claimIds: ['1', '2'], text: 'Other evidence' },
];
test('category selection is a union without duplicating multi-tagged entries', () => {
  assert.deepEqual(filterEntries(entries, ['1', '2']).map(e => e.exampleId), ['a', 'b', 'c']);
  assert.deepEqual(filterEntries(entries, ['2']).map(e => e.exampleId), ['b', 'c']);
});
test('keyword search intersects categories and searches category labels case-insensitively', () => {
  const claims = { '1': { claimShortText: 'Calls for violence' } };
  assert.deepEqual(filterEntries(entries, ['1'], 'ALPHA', claims).map(e => e.exampleId), ['a']);
  assert.equal(filterEntries(entries, [], 'calls violence', claims).length, 2);
  assert.equal(filterEntries(entries, ['2'], 'alpha', claims).length, 0);
});
test('empty queries retain entries and missing results stay empty', () => {
  assert.equal(filterEntries(entries, [], ' ').length, 3);
  assert.deepEqual(filterEntries(entries, [], 'nomatch'), []);
  assert.equal(closestEntry([], '2023-10-01'), null);
});
test('calendar counts use filtered event dates and nearest entry handles range boundaries', () => {
  assert.deepEqual(summarize(entries), { '2023-10-07': 2, '2023-11-01': 1 });
  assert.equal(closestEntry(entries, '2023-10-08').exampleId, 'c');
  assert.equal(closestEntry(entries, '2030-01-01').exampleId, 'c');
});
