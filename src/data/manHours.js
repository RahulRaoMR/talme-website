const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const IST_OFFSET_MS = 5.5 * HOUR_MS;
const WORK_START_MS = 9 * HOUR_MS;
const WORK_END_MS = 17 * HOUR_MS;
const WORK_DAY_MS = WORK_END_MS - WORK_START_MS;

// This shared checkpoint keeps the total consistent across visits and devices.
// To rebase the counter, update both the total and its corresponding IST time.
export const MAN_HOURS_BASE_TOTAL = 66000;
export const MAN_HOURS_BASELINE_TIMESTAMP = Date.parse(
  "2026-11-20T12:04:17+05:30"
);

function cumulativeWorkingMilliseconds(timestamp) {
  // Asia/Kolkata uses UTC+05:30 year-round, independent of the visitor's zone.
  const localTimestamp = timestamp + IST_OFFSET_MS;
  const day = Math.floor(localTimestamp / DAY_MS);
  const timeOfDay = localTimestamp - day * DAY_MS;
  const today = Math.min(
    WORK_DAY_MS,
    Math.max(0, timeOfDay - WORK_START_MS)
  );

  return day * WORK_DAY_MS + today;
}

const baselineWorkingMilliseconds = cumulativeWorkingMilliseconds(
  MAN_HOURS_BASELINE_TIMESTAMP
);

function elapsedWorkingMilliseconds(now) {
  return Math.max(
    0,
    cumulativeWorkingMilliseconds(now) - baselineWorkingMilliseconds
  );
}

export function getManHoursAt(now = Date.now()) {
  // Every day, including weekends, earns one man-hour per active clock hour.
  return MAN_HOURS_BASE_TOTAL + elapsedWorkingMilliseconds(now) / HOUR_MS;
}

export function formatManHours(total) {
  // Truncate to completed hundredths: each 0.01 represents 36 working seconds.
  // Slice the decimal text to avoid floating-point multiplication rounding down
  // an already exact hundredth (for example, 32768.01 * 100).
  const [whole, decimal = ""] = total.toString().split(".");
  return `${whole}.${decimal.slice(0, 2).padEnd(2, "0")}`;
}

export function getManHoursDisplayAt(now = Date.now()) {
  // Use integer working milliseconds so the stopwatch ticks exactly on each
  // completed second and shares the hours total's overnight pause.
  const seconds = Math.floor(elapsedWorkingMilliseconds(now) / 1000) % 60;

  return {
    hours: formatManHours(getManHoursAt(now)),
    seconds: String(seconds).padStart(2, "0"),
  };
}
