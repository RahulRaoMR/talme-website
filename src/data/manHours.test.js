import assert from "node:assert/strict";
import test from "node:test";
import {
  formatManHours,
  getManHoursAt,
  getManHoursDisplayAt,
  MAN_HOURS_BASELINE_TIMESTAMP,
  MAN_HOURS_BASE_TOTAL,
} from "./manHours.js";

const HOUR_MS = 60 * 60 * 1000;
const at = (timestamp) => getManHoursAt(Date.parse(timestamp));

test("starts at the shared checkpoint and does not go below its base", () => {
  assert.equal(getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP), 66000);
  assert.equal(getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP - 1), 66000);
  assert.equal(at("2026-11-19T12:00:00+05:30"), 66000);
});

test("adds one man-hour per elapsed working hour", () => {
  assert.equal(getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP + HOUR_MS), 66001);
  assert.equal(
    getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP + HOUR_MS / 2),
    66000.5
  );
  assert.equal(
    getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP + 1000),
    66000 + 1 / 3600
  );
});

test("stops precisely at 17:00 IST and stays frozen overnight", () => {
  // The first afternoon contains 4 hours, 55 minutes, and 43 seconds.
  const closingTotal = 66000 + (4 * 3600 + 55 * 60 + 43) / 3600;
  assert.ok(at("2026-11-20T16:59:59.999+05:30") < closingTotal);
  for (const timestamp of [
    "2026-11-20T17:00:00+05:30",
    "2026-11-20T17:00:00.001+05:30",
    "2026-11-20T23:59:59+05:30",
    "2026-11-21T00:00:00+05:30",
    "2026-11-21T08:59:59.999+05:30",
    "2026-11-21T09:00:00+05:30",
  ]) {
    assert.equal(at(timestamp), closingTotal, timestamp);
  }
});

test("resumes at 09:00 IST and retains the previous day's total", () => {
  const previousClose = at("2026-11-20T17:00:00+05:30");
  assert.ok(at("2026-11-21T09:00:00.001+05:30") > previousClose);
  assert.equal(at("2026-11-21T10:00:00+05:30"), previousClose + 1);
  assert.equal(at("2026-11-21T17:00:00+05:30"), previousClose + 8);
});

test("includes both Saturday and Sunday without resetting on return visits", () => {
  assert.equal(at("2026-11-21T12:04:17+05:30"), 66008);
  assert.equal(at("2026-11-22T12:04:17+05:30"), 66016);
  assert.equal(at("2026-11-23T12:04:17+05:30"), 66024);
});

test("uses IST working hours regardless of the input's timezone notation", () => {
  assert.equal(at("2026-11-20T06:34:17Z"), MAN_HOURS_BASE_TOTAL);
  assert.equal(at("2026-11-20T01:34:17-05:00"), MAN_HOURS_BASE_TOTAL);
  assert.equal(
    at("2026-11-21T03:29:59Z"),
    at("2026-11-20T11:30:00Z")
  );
  assert.equal(at("2026-11-21T06:34:17Z"), 66008);
});

test("carries through month, year, and leap-year boundaries", () => {
  assert.equal(at("2026-12-01T12:04:17+05:30"), 66000 + 11 * 8);
  assert.equal(at("2027-01-01T12:04:17+05:30"), 66000 + 42 * 8);
  assert.equal(at("2036-11-20T12:04:17+05:30"), 66000 + 3653 * 8);
});

test("shows two decimals without rounding up before 36 working seconds", () => {
  assert.equal(formatManHours(MAN_HOURS_BASE_TOTAL), "66000.00");
  assert.equal(
    formatManHours(getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP + 35999)),
    "66000.00"
  );
  assert.equal(
    formatManHours(getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP + 36000)),
    "66000.01"
  );
  assert.equal(
    formatManHours(getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP + HOUR_MS - 1)),
    "66000.99"
  );
  assert.equal(
    formatManHours(getManHoursAt(MAN_HOURS_BASELINE_TIMESTAMP + HOUR_MS)),
    "66001.00"
  );
  assert.equal(formatManHours(66000.99999), "66000.99");
  assert.equal(formatManHours(66000.00999999), "66000.00");
  assert.equal(formatManHours(32768.01), "32768.01");
  assert.equal(formatManHours(at("2026-11-20T17:00:00+05:30")), "66004.92");
});

test("ticks completed working seconds and rolls over after 59", () => {
  for (const [elapsed, hours, seconds] of [
    [-1, "66000.00", "00"],
    [0, "66000.00", "00"],
    [999, "66000.00", "00"],
    [1000, "66000.00", "01"],
    [59000, "66000.01", "59"],
    [59999, "66000.01", "59"],
    [60000, "66000.01", "00"],
    [61000, "66000.01", "01"],
    [HOUR_MS - 1, "66000.99", "59"],
    [HOUR_MS, "66001.00", "00"],
    [HOUR_MS + 1000, "66001.00", "01"],
  ]) {
    const timestamp = MAN_HOURS_BASELINE_TIMESTAMP + elapsed;
    const display = getManHoursDisplayAt(timestamp);
    assert.deepEqual(display, { hours, seconds }, `elapsed ${elapsed} ms`);
    assert.equal(display.hours, formatManHours(getManHoursAt(timestamp)));
  }
});

test("freezes the seconds overnight and resumes from the same value", () => {
  const closingDisplay = { hours: "66004.92", seconds: "43" };
  for (const timestamp of [
    "2026-11-20T17:00:00+05:30",
    "2026-11-20T23:59:59+05:30",
    "2026-11-21T08:59:59+05:30",
    "2026-11-21T09:00:00+05:30",
    "2026-11-21T09:00:00.999+05:30",
  ]) {
    assert.deepEqual(getManHoursDisplayAt(Date.parse(timestamp)), closingDisplay);
  }
  assert.deepEqual(
    getManHoursDisplayAt(Date.parse("2026-11-21T09:00:01+05:30")),
    { hours: "66004.92", seconds: "44" }
  );
  assert.deepEqual(
    getManHoursDisplayAt(Date.parse("2026-11-21T09:00:17+05:30")),
    { hours: "66004.93", seconds: "00" }
  );
});
