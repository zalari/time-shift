import type { TimeEntry } from '@time-shift/common';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

type WithMinutes = Pick<TimeEntry, 'at' | 'minutes'>;

export const getHoursFormat = (): Intl.NumberFormat => {
  return new Intl.NumberFormat(dayjs.locale(), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'unit',
    unit: 'hour',
    unitDisplay: 'narrow',
  });
};

export const getHoursUnit = (): string => {
  return getHoursFormat()
    .formatToParts(1)
    .find(({ type }) => type === 'unit')!.value;
};

export const getDuration = (entries: WithMinutes[]): number => {
  return entries.reduce((duration, { minutes }) => duration + minutes, 0);
};

export const getDurationForPeriod = (
  entries: WithMinutes[],
  from: Date,
  to = new Date(),
): number => {
  return getDuration(entries.filter(({ at }) => dayjs(at).isBetween(from, to)));
};

export const getDurationToday = (entries: WithMinutes[]): number => {
  return getDurationForPeriod(
    entries,
    dayjs().startOf('day').toDate(),
    dayjs().endOf('day').toDate(),
  );
};

export const getDurationYesterday = (entries: WithMinutes[]): number => {
  const yesterday = dayjs().subtract(1, 'day');
  return getDurationForPeriod(
    entries,
    yesterday.startOf('day').toDate(),
    yesterday.endOf('day').toDate(),
  );
};

export const getDurationDecimal = (minutes: number): string => {
  return getHoursFormat().format(minutes / 60);
};

export const getDurationFormatted = (minutes: number): string => {
  const unit = getHoursUnit();
  return dayjs.duration(minutes, 'minutes').format(`HH:mm[${unit}]`);
};

export const getReadableDate = (date: Date): string => {
  return dayjs(date).format('LL');
}
