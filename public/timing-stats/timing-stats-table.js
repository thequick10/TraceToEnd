// timing-stats-table.js

document.addEventListener('DOMContentLoaded', function() {
  const tableBody = document.getElementById('timingStatsTableBody');
  const exportBtn = document.getElementById('exportTimingStatsBtn');

  function updateStatCards() {
    const stats = TimingStats.getCurrentMonthStats();
    let totalTime = 0;
    let totalCount = 0;
    for (const day in stats) {
      totalTime += stats[day].totalTimeMs || 0;
      totalCount += stats[day].count || 0;
    }
    const avgTime = totalCount ? totalTime / totalCount : 0;
    document.getElementById('monthTotalResolutionTime').textContent = (totalTime / 1000).toFixed(2) + 's';
    document.getElementById('monthAvgResolutionTime').textContent = (avgTime / 1000).toFixed(2) + 's';
  }

  function renderTable() {
    const stats = TimingStats.getCurrentMonthStats();
    const days = Object.keys(stats).sort();
    tableBody.innerHTML = '';
    if (days.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="color:#888;">No timing stats for this month yet.</td></tr>';
      updateStatCards();
      return;
    }
    days.forEach(day => {
      const rec = stats[day];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${day}</td>
        <td>${(rec.totalTimeMs/1000).toFixed(2)}</td>
        <td>${(rec.avgTimeMs/1000).toFixed(2)}</td>
        <td>${rec.count}</td>
      `;
      tableBody.appendChild(tr);
    });
    updateStatCards();
  }

  //show realtime updates
  window.addEventListener('storage', function(e) {
    if (e.key === 'timingStatsHistory') {
      renderTable();
    }
  });

  exportBtn.onclick = function() {
    const csv = TimingStats.exportTimingStatsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timing-stats.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  renderTable();

  // Auto-refresh every 10 seconds
  setInterval(renderTable, 10000);
}); 

// Hide loader after page fully loads
window.addEventListener("load", () => {
  const loader = document.getElementById("page-loader");

  setTimeout(() => {
    loader.style.opacity = "0";

    setTimeout(() => {
      loader.style.display = "none";
    }, 600);
  }, 1000);
});