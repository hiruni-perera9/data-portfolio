'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

// Shared glass panel styling (keeps typography consistent and reduces duplication)
const primaryPanelClasses =
  "bg-black/30 border border-white/10 rounded-3xl p-6 shadow-lg backdrop-blur-xl";

export function DiscoverDashboard() {
  // Raw API payload (summary + metadata)
  const [dashboardData, setDashboardData] = useState(null);
  // Used for initial paint while the dashboard warms up
  const [loading, setLoading] = useState(true);
  // Separate spinner state for the refresh button (so skeletons do not flash)
  const [refreshing, setRefreshing] = useState(false);
  // Inline error message for retry UI
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Call our new Next.js route which aggregates PaleoDB data server-side
      const response = await fetch("/api/discover");
      if (!response.ok) {
        throw new Error("Failed to fetch fossil dashboard data");
      }

      const payload = await response.json();
      setDashboardData(payload);
    } catch (err) {
      console.error("Discover dashboard fetch error:", err);
      setError(err.message || "Unable to load dashboard data");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Convenience alias for the nested summary block
  const summary = dashboardData?.summary;
  const totalOccurrences = summary?.totalOccurrences || 0;

  // Memoised headline stats so the static tile array isn't regenerated unnecessarily
  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Total occurrences analysed",
        value: summary.totalOccurrences?.toLocaleString() || "0",
        hint: `${dashboardData?.sampleSize || 0} recent records`
      },
      {
        label: "Distinct time periods",
        value: summary.uniqueIntervals?.toLocaleString() || "0",
        hint: "Intervals represented"
      },
      {
        label: "Countries represented",
        value: summary.uniqueCountries?.toLocaleString() || "0",
        hint: "Modern locations"
      },
      {
        label: "Phyla captured",
        value: summary.uniquePhyla?.toLocaleString() || "0",
        hint: "Taxonomic breadth"
      }
    ];
  }, [summary, dashboardData?.sampleSize]);

  if (loading) {
    return (
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Skeleton hero */}
          <div className={`${primaryPanelClasses} animate-pulse h-32`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat card skeletons */}
            {[...Array(4)].map((_, idx) => (
              <div
                key={`stat-skeleton-${idx}`}
                className={`${primaryPanelClasses} h-32 animate-pulse`}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
              <div
                key={`panel-skeleton-${idx}`}
                className={`${primaryPanelClasses} h-64 animate-pulse`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-white/60 text-sm uppercase tracking-[0.3em]">
            Discover Dashboard
          </p>
          <h3 className="text-white text-3xl font-semibold">
            Fossil data is taking a break
          </h3>
          <p className="text-white/60">
            {error}. Please retry in a moment.
          </p>
          <button
            onClick={() => loadDashboard()}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-white hover:bg-white/20 transition-colors"
          >
            <span>Retry</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero panel (title, metadata, refresh button) */}
        <header className={`${primaryPanelClasses} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
          <div>
            <p className="text-white/60 text-sm uppercase tracking-[0.4em] mb-2">
              Discover
            </p>
            <h2 className="text-3xl font-bold text-white">
              Fossil Occurrence Dashboard
            </h2>
            <p className="text-white/60 text-sm">
              Powered by the Paleobiology Database • Updated{" "}
              {dashboardData?.updatedAt
                ? formatUpdatedTimestamp(dashboardData.updatedAt)
                : "just now"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {refreshing && (
              <span className="text-xs text-white/60">Refreshing…</span>
            )}
            <button
              disabled={refreshing}
              onClick={() => loadDashboard(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992m0 0V4.356m0 4.992-3.181-3.181a8.25 8.25 0 1 0 2.651 8.902"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`${primaryPanelClasses} space-y-3`}>
                <p className="text-white/50 text-xs uppercase tracking-[0.3em]">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="text-white/60 text-sm">{stat.hint}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interval distribution (wide) */}
          <div className={`${primaryPanelClasses} lg:col-span-2 space-y-4`}>
            <SectionHeader
              title="Occurrences by time period"
              description="Most common intervals across the analysed sample"
            />
            <div className="space-y-4">
              {summary?.timeDistribution?.length ? (
                summary.timeDistribution.map((bucket) => {
                  const percentage = totalOccurrences
                    ? Math.round((bucket.count / totalOccurrences) * 100)
                    : 0;
                  return (
                    <div
                      key={`${bucket.label}-${bucket.count}`}
                      className="bg-white/5 rounded-2xl border border-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-white font-semibold">{bucket.label}</p>
                          <p className="text-white/60 text-xs">
                            {formatAgeRange(bucket.maxMa, bucket.minMa)}
                            {bucket.averageMa !== null && (
                              <span> • ~{bucket.averageMa.toFixed(1)} Ma</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-2xl font-semibold">
                            {bucket.count}
                          </p>
                          <p className="text-white/60 text-xs">{percentage}% of sample</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400/80 to-sky-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState message="Not enough interval data to visualise yet." />
              )}
            </div>
          </div>

          <div className={`${primaryPanelClasses} space-y-4`}>
            <SectionHeader
              title="Taxonomic reach"
              description="Phyla represented in recent records"
            />
            <div className="space-y-3">
              {summary?.phylumDistribution?.length ? (
                summary.phylumDistribution.map((phylum) => {
                  const percentage = totalOccurrences
                    ? Math.max(
                        1,
                        Math.round((phylum.count / totalOccurrences) * 100)
                      )
                    : 0;
                  return (
                    <div
                      key={phylum.label}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-white font-medium">{phylum.label}</p>
                        <p className="text-xs text-white/60">{phylum.count} records</p>
                      </div>
                      <span className="text-sm text-emerald-300">
                        {percentage}% of sample
                      </span>
                    </div>
                  );
                })
              ) : (
                <EmptyState message="Phylum information is not available for this selection." />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${primaryPanelClasses} space-y-4`}>
            <SectionHeader
              title="Geographic spread"
              description="Top modern-day regions containing occurrences"
            />
            <div className="space-y-3">
              {summary?.locationDistribution?.length ? (
                summary.locationDistribution.map((region, index) => {
                  const percentage = totalOccurrences
                    ? Math.round((region.count / totalOccurrences) * 100)
                    : 0;
                  return (
                    <div
                      key={`${region.code}-${region.label}`}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {index + 1}. {region.label}
                        </p>
                        <p className="text-xs text-white/60 uppercase tracking-[0.3em]">
                          {region.code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{region.count}</p>
                        <p className="text-xs text-white/60">{percentage}%</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState message="No modern location data returned by PaleoDB for this sample." />
              )}
            </div>
          </div>

          <div className={`${primaryPanelClasses} space-y-4`}>
            <SectionHeader
              title="Stratigraphic hotspots"
              description="Formations or groups with repeated finds"
            />
            <div className="space-y-3">
              {summary?.stratigraphy?.length ? (
                summary.stratigraphy.map((formation) => (
                  <div
                    key={formation.label}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-white font-medium">{formation.label}</p>
                      <p className="text-xs text-white/60">
                        {formation.count} documented occurrences
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7.5l9-4.5 9 4.5-9 4.5L3 7.5zm0 9l9-4.5 9 4.5-9 4.5-9-4.5z"
                        />
                      </svg>
                      <span className="text-sm font-semibold">
                        {formation.count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="Stratigraphic details were not available for this dataset." />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div>
      <p className="text-white/50 text-xs uppercase tracking-[0.4em] mb-1">
        {title}
      </p>
      <p className="text-white/60 text-sm">{description}</p>
    </div>
  );
}

function formatUpdatedTimestamp(isoString) {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch (_error) {
    return "recently";
  }
}

function formatAgeRange(maxMa, minMa) {
  if (maxMa === null && minMa === null) {
    return "Age data unavailable";
  }

  if (maxMa !== null && minMa !== null) {
    return `${maxMa.toFixed(1)} – ${minMa.toFixed(1)} Ma`;
  }

  const value = maxMa ?? minMa;
  return value !== null ? `${value.toFixed(1)} Ma` : "Age data unavailable";
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
      {message}
    </div>
  );
}
