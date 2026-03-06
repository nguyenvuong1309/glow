import {takeLatest, put, call} from 'redux-saga/effects';
import {loadStats, loadStatsSuccess, loadStatsFailure} from './providerSlice';
import type {ProviderStats} from './providerSlice';
import {getProviderStatsRows} from '@/lib/supabase';
import type {ProviderStatsRow} from '@/lib/supabase';
import type {PayloadAction} from '@reduxjs/toolkit';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function computeStats(rows: ProviderStatsRow[]): ProviderStats {
  let monthlyRevenue = 0;
  let confirmedCount = 0;
  let cancelledCount = 0;
  let pendingCount = 0;

  const dayMap = new Map<string, number>();
  const svcMap = new Map<string, {count: number; revenue: number}>();
  const hourMap = new Map<string, number>();
  const dowMap = new Map<number, number>();

  for (const row of rows) {
    if (row.status === 'confirmed') {
      monthlyRevenue += row.price;
      confirmedCount++;
      dayMap.set(row.date, (dayMap.get(row.date) ?? 0) + row.price);
      const svc = svcMap.get(row.service_name) ?? {count: 0, revenue: 0};
      svc.count++;
      svc.revenue += row.price;
      svcMap.set(row.service_name, svc);
    } else if (row.status === 'cancelled') {
      cancelledCount++;
    } else {
      pendingCount++;
    }

    // Peak hours & busiest days: count all non-cancelled bookings
    if (row.status !== 'cancelled') {
      const hour = row.time_slot?.slice(0, 5) ?? '';
      if (hour) {
        hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
      }
      const dow = new Date(row.date + 'T00:00:00').getDay();
      dowMap.set(dow, (dowMap.get(dow) ?? 0) + 1);
    }
  }

  const revenueByDay = Array.from(dayMap, ([date, amount]) => ({date, amount})).sort(
    (a, b) => a.date.localeCompare(b.date),
  );

  const topServices = Array.from(svcMap, ([name, v]) => ({name, ...v})).sort(
    (a, b) => b.revenue - a.revenue,
  );

  const totalBookings = rows.length;
  const conversionRate =
    totalBookings > 0 ? (confirmedCount / totalBookings) * 100 : 0;

  const peakHours = Array.from(hourMap, ([hour, count]) => ({hour, count})).sort(
    (a, b) => b.count - a.count,
  );

  const busiestDays = Array.from(dowMap, ([dayOfWeek, count]) => ({
    dayOfWeek,
    dayName: DAY_NAMES[dayOfWeek],
    count,
  })).sort((a, b) => b.count - a.count);

  return {
    monthlyRevenue,
    confirmedCount,
    cancelledCount,
    pendingCount,
    revenueByDay,
    topServices,
    conversionRate,
    totalBookings,
    peakHours,
    busiestDays,
  };
}

function* handleLoadStats(
  action: PayloadAction<{month: number; year: number}>,
) {
  try {
    const {month, year} = action.payload;
    const rows: ProviderStatsRow[] = yield call(
      getProviderStatsRows,
      month,
      year,
    );
    const stats = computeStats(rows);
    yield put(loadStatsSuccess(stats));
  } catch {
    yield put(loadStatsFailure());
  }
}

export function* providerSaga() {
  yield takeLatest(loadStats.type, handleLoadStats);
}
