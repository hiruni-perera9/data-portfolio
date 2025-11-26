'use client';

import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const PERIODS = [
  {
    id: "triassic",
    label: "Triassic",
    range: "252–201 Ma",
    description: "Early dinosaurs emerge along the coasts of Pangaea.",
    gradient: "from-amber-500/70 to-orange-500/60"
  },
  {
    id: "jurassic",
    label: "Jurassic",
    range: "201–145 Ma",
    description: "Sauropods roam humid lowlands and rift valleys.",
    gradient: "from-sky-500/70 to-cyan-500/60"
  },
  {
    id: "cretaceous",
    label: "Cretaceous",
    range: "145–66 Ma",
    description: "Continents break apart and regional ecosystems flourish.",
    gradient: "from-emerald-500/70 to-lime-500/60"
  }
];

const MAP_WIDTH = 960;
const MAP_HEIGHT = 520;

const numberFormatter = new Intl.NumberFormat("en-US");

export function GeographicalDistribution() {
  const [selectedPeriod, setSelectedPeriod] = useState("jurassic");
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setError("");
      setSelectedRegion(null);

      try {
        const response = await fetch(`/api/geography?period=${selectedPeriod}`);
        if (!response.ok) {
          throw new Error("Unable to fetch distribution data.");
        }

        const payload = await response.json();
        if (!isMounted) return;

        setMapData(payload);
        setSelectedRegion(payload.regions?.[0] || null);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError("We couldn't load the fossil map right now. Try again shortly.");
        setMapData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedPeriod]);

  const worldFeatures = useMemo(() => {
    const { objects } = worldData;
    return feature(worldData, objects.countries).features;
  }, []);

  const projection = useMemo(() => {
    return geoMercator().scale(140).translate([MAP_WIDTH / 2, MAP_HEIGHT / 1.45]);
  }, []);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const regionLookup = useMemo(() => {
    const lookup = new Map();
    (mapData?.regions || []).forEach((region) => {
      if (region.numericCode) {
        lookup.set(region.numericCode, region);
      }
      if (region.code) {
        lookup.set(region.code, region);
      }
    });
    return lookup;
  }, [mapData]);

  const maxRegionCount = mapData?.maxRegionCount || 0;

  const getRegionForFeature = (feature) =>
    regionLookup.get(feature.id) ||
    regionLookup.get(countries.numericToAlpha2(feature.id) || "");

  const getFillForFeature = (feature) => {
    const region = getRegionForFeature(feature);
    if (!region || !maxRegionCount) {
      return "#0f172a";
    }

    const strength = Math.min(region.count / maxRegionCount, 1);
    const opacity = 0.15 + strength * 0.65;
    return `rgba(34,211,238,${opacity.toFixed(3)})`;
  };

  const handleRegionSelect = (feature) => {
    const region = getRegionForFeature(feature);
    if (region) {
      setSelectedRegion(region);
    }
  };

  const selectedMeta = PERIODS.find((period) => period.id === selectedPeriod);
  const topRegions = mapData?.regions?.slice(0, 6) || [];
  const stats = mapData?.summary;

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl text-white shadow-sky-900/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm uppercase tracking-[0.5em] text-white/50">Geographical Distribution</p>
              <h2 className="text-3xl font-semibold mt-2">Where the fossils were found</h2>
              <p className="text-white/70 mt-2">
                Select a period to see which landmasses produce the richest dinosaur fossil records.
              </p>
            </div>
            <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
              {PERIODS.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    selectedPeriod === period.id
                      ? "bg-white/90 text-slate-900 shadow-lg"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          {selectedMeta && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1">
                {selectedMeta.range}
              </span>
              <p>{selectedMeta.description}</p>
            </div>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-slate-950/40">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p className="text-white/60 text-sm uppercase tracking-[0.4em]">Fossil density</p>
                  <h3 className="text-xl font-semibold text-white">Interactive world map</h3>
                </div>
                {stats && (
                  <div className="text-right text-white/70 text-sm">
                    <p>Total occurrences: <span className="text-white font-semibold">{numberFormatter.format(stats.totalOccurrences || 0)}</span></p>
                    <p>Age window: {formatAgeRange(stats)}</p>
                  </div>
                )}
              </div>
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-[420px] text-white/70">
                    <div className="flex flex-col items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20">
                        <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"></path>
                        </svg>
                      </span>
                      <p className="text-sm">Plotting fossil records...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-[420px]">
                    <p className="text-white/70 text-sm text-center px-6">{error}</p>
                  </div>
                ) : (
                  <>
                    <svg
                      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                      className="w-full h-[420px]"
                      role="img"
                      aria-label="World map displaying fossil distribution"
                    >
                      <defs>
                        <radialGradient id="mapGlow" cx="50%" cy="50%" r="75%">
                          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#mapGlow)" />
                      {worldFeatures.map((featureItem) => {
                        const isSelected =
                          selectedRegion &&
                          (featureItem.id === selectedRegion.numericCode ||
                            countries.numericToAlpha2(featureItem.id) === selectedRegion.code);
                        return (
                          <path
                            key={`country-${featureItem.id}-${featureItem.properties?.name || 'unknown'}`}
                            d={pathGenerator(featureItem)}
                            fill={getFillForFeature(featureItem)}
                            stroke={isSelected ? "#fbbf24" : "rgba(255,255,255,0.08)"}
                            strokeWidth={isSelected ? 1.4 : 0.6}
                            className="transition-all duration-200 cursor-pointer hover:stroke-cyan-300"
                            onClick={() => handleRegionSelect(featureItem)}
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-2xl bg-black/30 backdrop-blur">
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <span className="inline-block h-3 w-3 rounded-full bg-cyan-300/90"></span>
                        Higher occurrence density
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <span>Click a highlighted region to inspect stats</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Top hotspots</p>
                  <h3 className="text-xl font-semibold">Regions with the most finds</h3>
                </div>
                <span className="text-sm text-white/70">Sample size: {numberFormatter.format(mapData?.summary?.totalOccurrences || 0)}</span>
              </div>
              <div className="space-y-3">
                {topRegions.length === 0 ? (
                  <p className="text-white/60 text-sm text-left">No occurrence records found for this period.</p>
                ) : (
                  topRegions.map((region, idx) => (
                    <button
                      key={region.numericCode || region.code || idx}
                      onClick={() => setSelectedRegion(region)}
                      className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-all text-left ${
                        selectedRegion?.code === region.code
                          ? "border-cyan-400/70 bg-cyan-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold">{region.label}</p>
                          <p className="text-xs text-white/60">{formatAgeRange(region)}</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold">{numberFormatter.format(region.count)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-white">
              <p className="text-xs uppercase tracking-[0.45em] text-white/50 mb-2">Period overview</p>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-white/70">Total occurrences</dt>
                  <dd className="text-xl font-semibold">{numberFormatter.format(stats?.totalOccurrences || 0)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-white/70">Regions represented</dt>
                  <dd className="text-xl font-semibold">{numberFormatter.format(mapData?.totalRegions || 0)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-white/70">Oldest sample</dt>
                  <dd className="text-lg font-semibold">{formatAge(stats?.earliestMa)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-white/70">Youngest sample</dt>
                  <dd className="text-lg font-semibold">{formatAge(stats?.latestMa)}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-black border border-white/10 rounded-3xl p-5 text-white">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-4">Region detail</p>
              {selectedRegion ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60">Selected area</p>
                    <h3 className="text-2xl font-semibold">{selectedRegion.label}</h3>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Occurrences</p>
                      <p className="text-3xl font-semibold">{numberFormatter.format(selectedRegion.count)}</p>
                    </div>
                    <div className="text-sm text-white/60">
                      <p>{formatAgeRange(selectedRegion)}</p>
                      <p className="mt-1">Avg. coordinates: {formatCoordinates(selectedRegion)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2">Prominent formations</p>
                    {selectedRegion.topFormations?.length ? (
                      <ul className="space-y-2">
                        {selectedRegion.topFormations.map((formation) => (
                          <li
                            key={formation.label}
                            className="flex items-center justify-between text-sm bg-white/5 border border-white/10 rounded-2xl px-3 py-2"
                          >
                            <span>{formation.label}</span>
                            <span className="text-white/60">{formation.count} finds</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-white/50 text-sm">No stratigraphic information recorded.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-white/60 text-sm">
                  Tap a highlighted region on the map to explore fossil statistics for that area.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatAge(value) {
  if (value === undefined || value === null) return "Unknown";
  return `${value.toFixed(1)} Ma`;
}

function formatAgeRange(source) {
  if (!source) return "Unknown";
  const { earliestMa, latestMa } = source;

  if (earliestMa === null && latestMa === null) return "Unknown";
  if (earliestMa !== null && latestMa !== null) {
    return `${latestMa.toFixed(1)}–${earliestMa.toFixed(1)} Ma`;
  }

  const single = earliestMa ?? latestMa;
  return single !== null ? `${single.toFixed(1)} Ma` : "Unknown";
}

function formatCoordinates(region) {
  if (!region || region.averageLat === null || region.averageLng === null) {
    return "Unknown";
  }

  return `${region.averageLat.toFixed(1)}°, ${region.averageLng.toFixed(1)}°`;
}
