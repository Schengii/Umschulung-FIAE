export const chartService = {
  renderWeeklyChart(containerId: string, history: any[]): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    const daysData: Array<{ label: string; dateStr: string; hours: number }> = [];
    const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const weekdayName = weekdays[d.getDay()];

      const dayLogs = history.filter((log: any) => log.date === dateString);
      let totalMs = 0;
      dayLogs.forEach((log: any) => {
        totalMs += log.netDurationMs || log.duration || 0;
      });
      const hours = Math.round((totalMs / 3600000) * 10) / 10;

      daysData.push({
        label: weekdayName,
        dateStr: dateString,
        hours,
      });
    }

    const width = container.clientWidth || 340;
    const height = 180;
    const paddingLeft = 30;
    const paddingRight = 10;
    const paddingTop = 25;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const maxVal = Math.max(...daysData.map(d => d.hours), 8);

    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
        <linearGradient id="barGradientSuccess" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
      </defs>
    `;

    const gridTicks = 4;
    for (let i = 0; i <= gridTicks; i++) {
      const yVal = maxVal * (i / gridTicks);
      const yPos = height - paddingBottom - (yVal / maxVal) * chartHeight;
      svg += `<line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" class="chart-grid-line" />`;
      svg += `<text x="${paddingLeft - 8}" y="${yPos + 4}" text-anchor="end" class="chart-text">${Math.round(yVal)}h</text>`;
    }

    const barSpacing = chartWidth / daysData.length;
    const barWidth = Math.min(barSpacing * 0.6, 24);

    daysData.forEach((data, index) => {
      const xPos = paddingLeft + index * barSpacing + (barSpacing - barWidth) / 2;
      const barHeight = (data.hours / maxVal) * chartHeight;
      const yPos = height - paddingBottom - barHeight;
      const isTargetMet = data.hours >= 8;
      const barColorClass = isTargetMet ? "chart-bar target-met" : "chart-bar";

      svg += `<rect x="${xPos}" y="${yPos}" width="${barWidth}" height="${Math.max(barHeight, 2)}" rx="4" class="${barColorClass}" />`;

      if (data.hours > 0) {
        svg += `<text x="${xPos + barWidth / 2}" y="${yPos - 6}" text-anchor="middle" class="chart-text" font-weight="600" fill="#f3f4f6">${data.hours.toFixed(1)}</text>`;
      }

      svg += `<text x="${xPos + barWidth / 2}" y="${height - 6}" text-anchor="middle" class="chart-text" font-weight="500">${data.label}</text>`;
    });

    svg += `<line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="chart-axis-line" />`;
    svg += `</svg>`;
    container.innerHTML = svg;
  },

  renderMonthlyChart(containerId: string, history: any[]): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    const daysData: Array<{ dayNum: number; hours: number; dateStr: string }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const dayNum = d.getDate();

      const dayLogs = history.filter((log: any) => log.date === dateString);
      let totalMs = 0;
      dayLogs.forEach((log: any) => {
        totalMs += log.netDurationMs || log.duration || 0;
      });
      const hours = Math.round((totalMs / 3600000) * 10) / 10;

      daysData.push({ dayNum, hours, dateStr: dateString });
    }

    const width = container.clientWidth || 340;
    const height = 180;
    const paddingLeft = 30;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const maxVal = Math.max(...daysData.map(d => d.hours), 8);

    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
    `;

    const gridTicks = 4;
    for (let i = 0; i <= gridTicks; i++) {
      const yVal = maxVal * (i / gridTicks);
      const yPos = height - paddingBottom - (yVal / maxVal) * chartHeight;
      svg += `<line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" class="chart-grid-line" />`;
      svg += `<text x="${paddingLeft - 8}" y="${yPos + 4}" text-anchor="end" class="chart-text">${Math.round(yVal)}h</text>`;
    }

    const points: Array<{ x: number; y: number; data: any }> = [];
    const spacing = chartWidth / (daysData.length - 1);

    daysData.forEach((data, index) => {
      const x = paddingLeft + index * spacing;
      const y = height - paddingBottom - (data.hours / maxVal) * chartHeight;
      points.push({ x, y, data });
    });

    let pathD = "";
    let areaD = `M ${points[0].x} ${height - paddingBottom} `;

    points.forEach((pt, index) => {
      if (index === 0) {
        pathD += `M ${pt.x} ${pt.y} `;
      } else {
        pathD += `L ${pt.x} ${pt.y} `;
      }
      areaD += `L ${pt.x} ${pt.y} `;
    });

    areaD += `L ${points[points.length - 1].x} ${height - paddingBottom} Z`;

    svg += `<path d="${areaD}" class="chart-area" />`;
    svg += `<path d="${pathD}" class="chart-line" />`;

    points.forEach((pt, index) => {
      const showPoint = pt.data.hours > 0 || index % 5 === 0;

      if (showPoint) {
        svg += `<circle cx="${pt.x}" cy="${pt.y}" r="4" class="chart-point">
          <title>${pt.data.dateStr}: ${pt.data.hours} Std.</title>
        </circle>`;
      }

      if (index % 5 === 0 || index === points.length - 1) {
        svg += `<text x="${pt.x}" y="${height - 6}" text-anchor="middle" class="chart-text">${pt.data.dayNum}</text>`;
      }
    });

    svg += `<line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="chart-axis-line" />`;
    svg += `</svg>`;
    container.innerHTML = svg;
  },

  renderProjectDonutChart(containerId: string, projectsData: any[]): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!projectsData || projectsData.length === 0) {
      container.innerHTML =
        '<div class="text-muted" style="text-align:center;">Keine Projektzeiten erfasst</div>';
      return;
    }

    let totalMs = 0;
    projectsData.forEach((p: any) => (totalMs += p.totalMs || 0));

    if (totalMs === 0) {
      container.innerHTML =
        '<div class="text-muted" style="text-align:center;">Keine Projektzeiten erfasst</div>';
      return;
    }

    const width = 250;
    const height = 250;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 80;
    const strokeWidth = 30;

    const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    let currentAngle = 0;
    let legendHtml =
      '<div style="display:flex; flex-wrap:wrap; justify-content:center; margin-top:10px; gap:10px;">';

    projectsData.forEach((p: any, index: number) => {
      if (!p.totalMs) return;

      const slicePercentage = p.totalMs / totalMs;
      const sliceAngle = slicePercentage * 360;

      const startX = cx + radius * Math.cos(((currentAngle - 90) * Math.PI) / 180);
      const startY = cy + radius * Math.sin(((currentAngle - 90) * Math.PI) / 180);
      const endX = cx + radius * Math.cos(((currentAngle + sliceAngle - 90) * Math.PI) / 180);
      const endY = cy + radius * Math.sin(((currentAngle + sliceAngle - 90) * Math.PI) / 180);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const color = colors[index % colors.length];

      if (slicePercentage > 0.001) {
        if (slicePercentage >= 0.999) {
          svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
        } else {
          const d = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
          svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
        }
      }

      currentAngle += sliceAngle;

      const hrs = (p.totalMs / 3600000).toFixed(1);
      legendHtml += `
        <div style="display:flex; align-items:center; font-size:12px; color:var(--text-secondary);">
          <div style="width:12px; height:12px; border-radius:50%; background-color:${color}; margin-right:5px;"></div>
          ${p.name} (${hrs}h)
        </div>
      `;
    });

    const totalHrs = (totalMs / 3600000).toFixed(1);
    svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="20" font-weight="bold" fill="var(--text-primary)">${totalHrs}h</text>`;
    svg += `<text x="${cx}" y="${cy + 20}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="var(--text-muted)">Gesamt</text>`;

    svg += `</svg>`;

    legendHtml += "</div>";

    container.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; width:100%;">
      <div style="width:${width}px; height:${height}px;">${svg}</div>
      ${legendHtml}
    </div>`;
  },
};

if (typeof window !== "undefined") {
  (window as any).chartService = chartService;
}
