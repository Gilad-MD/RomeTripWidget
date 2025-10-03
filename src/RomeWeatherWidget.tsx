import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sun, Sunrise, Sunset, Wind, Droplets, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Beautiful, auto-updating weather widget for Rome, Italy.
 * Data source: Open‑Meteo (https://open-meteo.com/) — free, reliable, no API key required.
 *
 * Features
 * - Current temperature, feels like, humidity, wind
 * - Weather description + icon based on Open‑Meteo weather_code
 * - Today's sunrise and sunset times (Europe/Rome timezone)
 * - Auto‑refresh every 10 minutes (configurable)
 * - Smooth entry animations and subtle hover effects
 * - Accessible and responsive
 */

// ---- Configuration ----
const LAT = 41.8933; // Rome
const LON = 12.4829; // Rome
const TIMEZONE = "Europe/Rome";
const REFRESH_MS = 10 * 60 * 1000; // 10 minutes

// Open‑Meteo endpoint (trusted source)
const ENDPOINT = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&daily=sunrise,sunset&timezone=${encodeURIComponent(
  TIMEZONE
)}`;

// Weather code mapping from Open‑Meteo (subset of the full table)
const codeMap: Record<number, { label: string; icon: React.ReactNode }> = {
  0: { label: "Clear sky", icon: <Sun className="w-6 h-6" aria-hidden /> },
  1: { label: "Mainly clear", icon: <Sun className="w-6 h-6" aria-hidden /> },
  2: { label: "Partly cloudy", icon: <Sun className="w-6 h-6" aria-hidden /> },
  3: { label: "Overcast", icon: <Sun className="w-6 h-6" aria-hidden /> },
  45: { label: "Fog", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  48: { label: "Depositing rime fog", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  51: { label: "Light drizzle", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  53: { label: "Moderate drizzle", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  55: { label: "Dense drizzle", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  61: { label: "Light rain", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  63: { label: "Moderate rain", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  65: { label: "Heavy rain", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  71: { label: "Light snow", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  73: { label: "Moderate snow", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  75: { label: "Heavy snow", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  95: { label: "Thunderstorm", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  96: { label: "Thunderstorm w/ hail", icon: <Droplets className="w-6 h-6" aria-hidden /> },
  99: { label: "Thunderstorm w/ hail", icon: <Droplets className="w-6 h-6" aria-hidden /> },
};

function formatTime(isoString?: string) {
  if (!isoString) return "–";
  try {
    const dt = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TIMEZONE,
    }).format(dt);
  } catch {
    return "–";
  }
}

function useInterval(callback: () => void, delay: number | null) {
  const savedRef = useRef(callback);
  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default function RomeWeatherWidget() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = async () => {
    try {
      setError(null);
      const res = await fetch(ENDPOINT, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh on an interval
    // You can change REFRESH_MS above to tune frequency
  }, []);

  useInterval(() => {
    fetchWeather();
  }, REFRESH_MS);

  const current = data?.current;
  const daily = data?.daily;

  const sunrise = daily?.sunrise?.[0];
  const sunset = daily?.sunset?.[0];

  const code = current?.weather_code ?? -1;
  const now = useMemo(() => new Date(), []);

  const codeInfo = codeMap[code] || { label: "Conditions", icon: <Sun className="w-6 h-6" aria-hidden /> };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto"
      aria-live="polite"
    >
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 shadow-xl bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 border border-white/60 backdrop-blur"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/60 p-2 shadow-inner">{codeInfo.icon}</div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Rome, Italy</h2>
              <p className="text-xs text-slate-600">{new Intl.DateTimeFormat("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: TIMEZONE,
              }).format(now)}</p>
            </div>
          </div>

          <button
            onClick={fetchWeather}
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Refresh weather now"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform" />
            Refresh
          </button>
        </div>

        {/* Main stats */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <motion.div
              key={current?.temperature_2m}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-end gap-3"
            >
              <span className="text-5xl font-extrabold leading-none">
                {typeof current?.temperature_2m === "number" ? Math.round(current.temperature_2m) : "–"}°
              </span>
              <span className="text-sm text-slate-700 mb-1">{codeInfo.label}</span>
            </motion.div>
            <p className="mt-1 text-xs text-slate-600">
              Feels like {typeof current?.apparent_temperature === "number" ? Math.round(current.apparent_temperature) : "–"}° ·
              Humidity {typeof current?.relative_humidity_2m === "number" ? Math.round(current.relative_humidity_2m) : "–"}% ·
              Wind {typeof current?.wind_speed_10m === "number" ? Math.round(current.wind_speed_10m) : "–"} km/h
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-xl bg-white/70 p-4 shadow-sm border border-white/70"
          >
            <div className="flex items-center gap-2 text-sm font-semibold"><Sunrise className="w-4 h-4" /> Sunrise</div>
            <div className="mt-1 text-lg font-bold" aria-label={`Sunrise at ${formatTime(sunrise)}`}>{formatTime(sunrise)}<span className="text-xs text-slate-600 ml-1">CET/CEST</span></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl bg-white/70 p-4 shadow-sm border border-white/70"
          >
            <div className="flex items-center gap-2 text-sm font-semibold"><Sunset className="w-4 h-4" /> Sunset</div>
            <div className="mt-1 text-lg font-bold" aria-label={`Sunset at ${formatTime(sunset)}`}>{formatTime(sunset)}<span className="text-xs text-slate-600 ml-1">CET/CEST</span></div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> {typeof current?.wind_speed_10m === "number" ? `${Math.round(current.wind_speed_10m)} km/h` : "–"}</span>
            <span className="inline-flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> {typeof current?.relative_humidity_2m === "number" ? `${Math.round(current.relative_humidity_2m)}%` : "–"}</span>
          </div>
          <div>
            {lastUpdated ? (
              <span>Updated {new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(lastUpdated)}</span>
            ) : (
              <span>Loading…</span>
            )}
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="mt-4 text-xs text-slate-500">Fetching weather…</div>
        )}
        {error && (
          <div className="mt-4 text-xs text-red-600">{error}</div>
        )}

        {/* Attribution */}
        <div className="mt-4 text-[10px] text-slate-500">
          Data: Open‑Meteo · Coordinates: {LAT.toFixed(4)}, {LON.toFixed(4)} · Timezone: {TIMEZONE}
        </div>
      </div>
    </motion.div>
  );
}
