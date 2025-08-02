// timing-stats.js
// Utility for tracking, storing, and exporting URL resolution timing stats on a daily basis

const TIMING_STATS_KEY = 'timingStatsHistory';

function getTodayDateStr() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getCurrentMonthStr() {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function loadTimingStats() {
  const raw = localStorage.getItem(TIMING_STATS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveTimingStats(stats) {
  localStorage.setItem(TIMING_STATS_KEY, JSON.stringify(stats));
}

function addTimingRecord(totalTimeMs, avgTimeMs, count) {
  const stats = loadTimingStats();
  const today = getTodayDateStr();
  const month = today.slice(0, 7); // YYYY-MM
  if (!stats[month]) stats[month] = {};
  if (stats[month][today]) {
    // Accumulate
    const prev = stats[month][today];
    const newCount = prev.count + count;
    const newTotalTime = prev.totalTimeMs + totalTimeMs;
    // Weighted average for avgTimeMs
    const newAvgTime = newCount > 0 ? newTotalTime / newCount : 0;
    stats[month][today] = {
      totalTimeMs: newTotalTime,
      avgTimeMs: newAvgTime,
      count: newCount
    };
  } else {
    stats[month][today] = { totalTimeMs, avgTimeMs, count };
  }
  saveTimingStats(stats);
}

function getCurrentMonthStats() {
  const stats = loadTimingStats();
  const month = getCurrentMonthStr();
  return stats[month] || {};
}

function autoResetOldMonths() {
  const stats = loadTimingStats();
  const now = new Date();
  const thisMonth = getCurrentMonthStr();
  // Remove months older than 1 month
  for (const month in stats) {
    if (month !== thisMonth) {
      delete stats[month];
    }
  }
  saveTimingStats(stats);
}

function exportTimingStatsCSV() {
  const stats = loadTimingStats();
  let csv = 'Date,Total Time (s),Avg Time per URL (s),Count\n';
  for (const month in stats) {
    for (const day in stats[month]) {
      const rec = stats[month][day];
      csv += `${day},${(rec.totalTimeMs/1000).toFixed(2)},${(rec.avgTimeMs/1000).toFixed(2)},${rec.count}\n`;
    }
  }
  return csv;
}

// Call this on app load to auto-reset
autoResetOldMonths();

// Export functions for use in other scripts
window.TimingStats = {
  addTimingRecord,
  getCurrentMonthStats,
  exportTimingStatsCSV,
}; 