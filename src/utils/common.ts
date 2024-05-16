import dayjs from 'dayjs';
import { $t } from '@/locales';

/**
 * Transform record to option
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```;
 *
 * @param record
 */
export function transformRecordToOption<T extends Record<string, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label
  })) as CommonType.Option<keyof T>[];
}

/**
 * Translate options
 *
 * @param options
 */
export function translateOptions(options: CommonType.Option<string>[]) {
  return options.map(option => ({
    ...option,
    label: $t(option.label as App.I18n.I18nKey)
  }));
}

/**
 * Toggle html class
 *
 * @param className
 */
export function toggleHtmlClass(className: string) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove
  };
}

/**
 * Add date range to search parameters
 *
 * @param params - The search parameters object
 * @param dateRange - An array containing the start and end dates of the range
 * @param propName - Optional property name prefix for the date range
 * @returns The updated search parameters object
 */
export const addDateRange = (params?: any, dateRange?: Api.Common.Value | null, propName?: string) => {
  let search = { ...params }; // Make a shallow copy of the params
  search.params =
    typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};

  if (dateRange) {
    const [startDate, endDate] = dateRange.map(date => dayjs(new Date(date)).format('YYYY-MM-DD')); // Convert date strings to Date objects

    if (typeof propName === 'undefined') {
      search.params.beginTime = startDate;
      search.params.endTime = endDate;
    } else {
      search.params[`begin${propName}`] = startDate;
      search.params[`end${propName}`] = endDate;
    }
  }

  delete search.dateRange;

  // 去掉值为 null 的对象属性
  search = Object.fromEntries(Object.entries(search).filter(([_, value]) => value !== null));

  return search;
};
