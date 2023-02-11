import { TimeEntry } from '@time-shift/common';
import { findWorklogIssuesByPrefixes } from './preflight.utils';

describe('preflight.utils', () => {
  describe('findWorklogIssuesByPrefixes', () => {
    it('should return an empty map if no time entries are given', () => {
      // GIVEN
      // WHEN
      const result = findWorklogIssuesByPrefixes([], ['ABC-']);
      // THEN
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should group non-matching entries under undefined', () => {
      // GIVEN
      const at = new Date('2023-02-10');
      const timeEntries = [
        { at, minutes: 15 },
        { at, minutes: 15, note: '' },
        { at, minutes: 30, note: 'foo bar' },
      ] satisfies TimeEntry[];
      // WHEN
      const result = findWorklogIssuesByPrefixes(timeEntries, ['ABC-']);
      // THEN
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get(undefined)).toBeInstanceOf(Set);
      expect(result.get(undefined)?.size).toBe(3);
    });

    it('should map entries with a single key', () => {
      // GIVEN
      const at = new Date('2023-02-10');
      const timeEntries = [
        { at, minutes: 15, note: 'ABC-123' },
        { at, minutes: 30, note: 'ABC-456' },
        { at, minutes: 15, note: 'ABC-789' },
      ] satisfies TimeEntry[];
      // WHEN
      const result = findWorklogIssuesByPrefixes(timeEntries, ['ABC-']);
      // THEN
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
    });

    it('should map entries with multiple keys', () => {
      // GIVEN
      const at = new Date('2023-02-10');
      const timeEntries = [
        { at, minutes: 15, note: 'ABC-123\nABC-567' },
        { at, minutes: 30, note: 'ABC-000\nDEF-789' },
        { at, minutes: 15, note: 'DEF-789\nABC-123\nDEF-8888' },
      ] satisfies TimeEntry[];
      // WHEN
      const result = findWorklogIssuesByPrefixes(timeEntries, ['ABC-', 'DEF-']);
      // THEN
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(5);
      expect(result.get('ABC-000')?.size).toBe(1);
      expect(result.get('ABC-123')?.size).toBe(2);
      expect(result.get('ABC-567')?.size).toBe(1);
      expect(result.get('DEF-789')?.size).toBe(2);
      expect(result.get('DEF-8888')?.size).toBe(1);
    });

    it('should map entries with multiple keys', () => {
      // GIVEN
      const at = new Date('2023-02-10');
      const timeEntries = [
        { at, minutes: 60, note: 'ABC-123\nABC-123' },
        { at, minutes: 30, note: 'ABC-123\nABC-456' },
      ] satisfies TimeEntry[];
      // WHEN
      const result = findWorklogIssuesByPrefixes(timeEntries, ['ABC-']);
      const abc123 = Array.from(result.get('ABC-123')!);
      const abc456 = Array.from(result.get('ABC-456')!);
      // THEN
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
      expect(abc123).toHaveLength(2);
      expect(abc456).toHaveLength(1);
      expect(abc123[0].minutes).toBe(60);
      expect(abc123[1].minutes).toBe(15);
      expect(abc456[0].minutes).toBe(15);
    });
  });
});
