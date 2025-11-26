import { NextResponse } from "next/server";
import { getFossilOccurrences } from "@/lib/paleodb";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const REGION_ALIASES = {
  UK: "GB",
  EN: "GB",
  SC: "GB"
};

const PERIODS = {
  triassic: {
    label: "Triassic",
    range: "252–201 Ma",
    minMa: 201.3,
    maxMa: 252.2,
    description: "Early dinosaurs emerge across Pangaea while reptiles dominate the land."
  },
  jurassic: {
    label: "Jurassic",
    range: "201–145 Ma",
    minMa: 145.0,
    maxMa: 201.3,
    description: "Warm, humid climates create lush habitats for sauropods and early birds."
  },
  cretaceous: {
    label: "Cretaceous",
    range: "145–66 Ma",
    minMa: 66.0,
    maxMa: 145.0,
    description: "Continental breakup sparks regional diversification until the mass extinction."
  }
};

const DEFAULT_REGION_LABEL = "Unknown region";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const periodKey = (searchParams.get("period") || "jurassic").toLowerCase();
  const period = PERIODS[periodKey];

  if (!period) {
    return NextResponse.json(
      { error: "Unsupported period requested." },
      { status: 400 }
    );
  }

  try {
    const response = await getFossilOccurrences("Dinosauria", {
      // PaleoDB caps responses, so request a large batch to capture as many regions as possible
      limit: 1500,
      show: "coords,loc,paleoloc,stratext,phylo",
      min_ma: period.minMa,
      max_ma: period.maxMa
    });

    const records = response.records || [];
    const distribution = buildDistribution(records);

    return NextResponse.json({
      period: { id: periodKey, ...period },
      generatedAt: new Date().toISOString(),
      sampleSize: records.length,
      totalRegions: distribution.regions.length,
      maxRegionCount: distribution.maxRegionCount,
      regions: distribution.regions,
      summary: {
        totalOccurrences: records.length,
        earliestMa: distribution.earliestMa,
        latestMa: distribution.latestMa
      }
    });
  } catch (error) {
    console.error("Geography API error:", error);
    return NextResponse.json(
      { error: "Unable to load geographic fossil data." },
      { status: 500 }
    );
  }
}

function buildDistribution(records = []) {
  const regionMap = new Map();
  let earliestMa = null;
  let latestMa = null;

  records.forEach((record) => {
    const earlyAge = toNumber(record.eag);
    const lateAge = toNumber(record.lag);

    if (earlyAge !== null) {
      earliestMa = earliestMa === null ? earlyAge : Math.max(earliestMa, earlyAge);
    }
    if (lateAge !== null) {
      latestMa = latestMa === null ? lateAge : Math.min(latestMa, lateAge);
    }

    aggregateRegion(record, regionMap);
  });

  const regions = Array.from(regionMap.values())
    .map(formatRegionBucket)
    .sort((a, b) => b.count - a.count);

  const maxRegionCount = regions.reduce(
    (max, region) => Math.max(max, region.count),
    0
  );

  return {
    regions,
    maxRegionCount,
    earliestMa,
    latestMa
  };
}

function aggregateRegion(record, regionMap) {
  const { code, numericCode, label } = resolveCountry(record.cc2);
  const key = numericCode || code || "UNK";

  const bucket =
    regionMap.get(key) ||
    {
      code,
      numericCode,
      label,
      count: 0,
      earliestMa: null,
      latestMa: null,
      latSum: 0,
      lngSum: 0,
      coordinateCount: 0,
      formations: new Map()
    };

  bucket.count += 1;

  const lat = toNumber(record.lat);
  const lng = toNumber(record.lng);

  if (lat !== null && lng !== null) {
    bucket.latSum += lat;
    bucket.lngSum += lng;
    bucket.coordinateCount += 1;
  }

  const earlyAge = toNumber(record.eag);
  const lateAge = toNumber(record.lag);

  if (earlyAge !== null) {
    bucket.earliestMa = bucket.earliestMa === null ? earlyAge : Math.max(bucket.earliestMa, earlyAge);
  }
  if (lateAge !== null) {
    bucket.latestMa = bucket.latestMa === null ? lateAge : Math.min(bucket.latestMa, lateAge);
  }

  const formation = record.sfm || record.sgr || record.ssc || null;
  if (formation) {
    const count = bucket.formations.get(formation) || 0;
    bucket.formations.set(formation, count + 1);
  }

  regionMap.set(key, bucket);
}

function formatRegionBucket(bucket) {
  const topFormations = Array.from(bucket.formations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }));

  return {
    code: bucket.code,
    numericCode: bucket.numericCode,
    label: bucket.label,
    count: bucket.count,
    earliestMa: bucket.earliestMa,
    latestMa: bucket.latestMa,
    averageLat:
      bucket.coordinateCount > 0 ? bucket.latSum / bucket.coordinateCount : null,
    averageLng:
      bucket.coordinateCount > 0 ? bucket.lngSum / bucket.coordinateCount : null,
    topFormations
  };
}

function resolveCountry(rawCode) {
  if (!rawCode || rawCode === "__") {
    return { code: "UNK", numericCode: null, label: DEFAULT_REGION_LABEL };
  }

  const normalized = (REGION_ALIASES[rawCode] || rawCode).trim().toUpperCase();
  const numericCode = countries.alpha2ToNumeric(normalized) || null;
  const label =
    countries.getName(normalized, "en") || DEFAULT_REGION_LABEL;

  return {
    code: normalized,
    numericCode,
    label
  };
}

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
