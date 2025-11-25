import { NextResponse } from "next/server";
import { getFossilOccurrences } from "@/lib/paleodb";

// PaleoDB sometimes returns non-ISO country codes; normalise obvious ones
const REGION_ALIASES = {
  UK: "GB",
  EN: "GB",
  SC: "GB"
};

// Browser-provided helper that turns ISO country codes into readable labels
const REGION_NAMES =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const DEFAULT_REGION_LABEL = "Unknown region";

// GET /api/discover
// Pulls a chunk of Dinosauria occurrences and returns aggregated dashboard metrics
export async function GET() {
  try {
    // Ask PaleoDB for the latest occurrence set, including location + stratigraphy fields
    const response = await getFossilOccurrences("Dinosauria", {
      limit: 500,
      show: "coords,loc,paleoloc,stratext,phylo"
    });

    const records = response.records || [];
    const summary = buildSummary(records);

    return NextResponse.json({
      summary,
      sampleSize: records.length,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Discover dashboard error:", error);
    return NextResponse.json(
      { error: "Unable to load fossil dashboard data" },
      { status: 500 }
    );
  }
}

/**
 * Convert raw PaleoDB records into the counts the dashboard expects.
 */
function buildSummary(records = []) {
  const timeMap = new Map();
  const countryMap = new Map();
  const phylumMap = new Map();
  const formationMap = new Map();

  records.forEach((record) => {
    aggregateTime(record, timeMap);
    aggregateLocation(record, countryMap);
    aggregatePhylum(record, phylumMap);
    aggregateFormation(record, formationMap);
  });

  return {
    totalOccurrences: records.length,
    uniqueIntervals: timeMap.size,
    uniqueCountries: countryMap.size,
    uniquePhyla: phylumMap.size,
    timeDistribution: formatTimeDistribution(timeMap).slice(0, 8),
    locationDistribution: formatDistribution(countryMap).slice(0, 8),
    phylumDistribution: formatDistribution(phylumMap).slice(0, 6),
    stratigraphy: formatDistribution(formationMap).slice(0, 6)
  };
}

function aggregateTime(record, timeMap) {
  const interval = record.oei || record.oli || "Unknown interval";
  const earlyAge = toNumber(record.eag);
  const lateAge = toNumber(record.lag);
  const midpoint =
    earlyAge !== null && lateAge !== null
      ? (earlyAge + lateAge) / 2
      : earlyAge ?? lateAge ?? null;

  const bucket =
    timeMap.get(interval) || {
      label: interval,
      count: 0,
      totalMidpoint: 0,
      entriesWithAge: 0,
      maxMa: null,
      minMa: null
    };

  bucket.count += 1;

  if (midpoint !== null) {
    // Track a running average so we can display an approximate mid age
    bucket.totalMidpoint += midpoint;
    bucket.entriesWithAge += 1;
  }

  if (earlyAge !== null) {
    bucket.maxMa = bucket.maxMa === null ? earlyAge : Math.max(bucket.maxMa, earlyAge);
  }
  if (lateAge !== null) {
    bucket.minMa = bucket.minMa === null ? lateAge : Math.min(bucket.minMa, lateAge);
  }

  timeMap.set(interval, bucket);
}

function aggregateLocation(record, countryMap) {
  const { code, label } = resolveCountry(record.cc2);
  const key = code || "UNK";

  const bucket =
    countryMap.get(key) || {
      label,
      code: key,
      count: 0
    };

  bucket.count += 1;
  bucket.label = label;

  countryMap.set(key, bucket);
}

function aggregatePhylum(record, phylumMap) {
  const key = record.phl || "Unknown";
  const bucket =
    phylumMap.get(key) || {
      label: key,
      count: 0
    };

  bucket.count += 1;
  phylumMap.set(key, bucket);
}

function aggregateFormation(record, formationMap) {
  const label = record.sfm || record.sgr || record.ssc || null;
  if (!label) return;

  const bucket =
    formationMap.get(label) || {
      label,
      count: 0
    };

  bucket.count += 1;
  formationMap.set(label, bucket);
}

function formatTimeDistribution(timeMap) {
  return Array.from(timeMap.values())
    .map((bucket) => ({
      ...bucket,
      averageMa:
        bucket.entriesWithAge > 0
          ? bucket.totalMidpoint / bucket.entriesWithAge
          : null
    }))
    .sort((a, b) => (b.averageMa ?? 0) - (a.averageMa ?? 0));
}

function formatDistribution(map) {
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function resolveCountry(rawCode) {
  if (!rawCode || rawCode === "__") {
    return { code: "UNK", label: DEFAULT_REGION_LABEL };
  }

  const normalized = rawCode.trim().toUpperCase();
  const code = REGION_ALIASES[normalized] || normalized;

  if (!REGION_NAMES) {
    return { code, label: code };
  }

  try {
    return {
      code,
      label: REGION_NAMES.of(code) || code
    };
  } catch (_error) {
    return { code, label: code };
  }
}

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
