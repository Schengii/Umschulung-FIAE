const chartService = {
  
  /**
   * Renders the weekly bar chart (last 7 days)
   */
  renderWeeklyChart(containerId, history) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Prepare Data
    const daysData = [];
    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    
    // Generate last 7 days list
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const weekdayName = weekdays[d.getDay()];
      
      // Calculate total duration for this date string in history
      const dayLogs = history.filter(log => log.date === dateString);
      let totalMs = 0;
      dayLogs.forEach(log => {
        totalMs += log.duration || 0;
      });
      const hours = Math.round((totalMs / 3600000) * 10) / 10; // 1 decimal place

      daysData.push({
        label: weekdayName,
        dateStr: dateString,
        hours: hours
      });
    }

    // 2. Chart Layout Params
    const width = container.clientWidth || 340;
    const height = 180;
    const paddingLeft = 30;
    const paddingRight = 10;
    const paddingTop = 25;
    const paddingBottom = 25;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // Max hours value (min 8 to scale nicely)
    const maxVal = Math.max(...daysData.map(d => d.hours), 8);
    
    // 3. Generate SVG String
    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Bar Gradient -->
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
        <!-- Success Bar Gradient -->
        <linearGradient id="barGradientSuccess" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
        <!-- Grid Grid Pattern -->
        <pattern id="grid" width="${width}" height="25" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="${width}" y2="0" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
        </pattern>
      </defs>
    `;

    // Draw Grid Lines (y-axis)
    const gridTicks = 4;
    for (let i = 0; i <= gridTicks; i++) {
      const yVal = maxVal * (i / gridTicks);
      const yPos = height - paddingBottom - (yVal / maxVal) * chartHeight;
      
      // Grid line
      svg += `<line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" class="chart-grid-line" />`;
      // Y label
      svg += `<text x="${paddingLeft - 8}" y="${yPos + 4}" text-anchor="end" class="chart-text">${Math.round(yVal)}h</text>`;
    }

    // Draw Bars
    const barSpacing = chartWidth / daysData.length;
    const barWidth = Math.min(barSpacing * 0.6, 24); // Cap bar width
    
    daysData.forEach((data, index) => {
      const xPos = paddingLeft + (index * barSpacing) + (barSpacing - barWidth) / 2;
      const barHeight = (data.hours / maxVal) * chartHeight;
      const yPos = height - paddingBottom - barHeight;

      // Draw active bar with a glow if it exceeds daily target (e.g. 8h)
      const isTargetMet = data.hours >= 8;
      const barColorClass = isTargetMet ? 'chart-bar target-met' : 'chart-bar';
      
      // Draw Bar Rect
      svg += `<rect x="${xPos}" y="${yPos}" width="${barWidth}" height="${Math.max(barHeight, 2)}" rx="4" class="${barColorClass}" />`;
      
      // Value label on top of bar (if > 0)
      if (data.hours > 0) {
        svg += `<text x="${xPos + barWidth / 2}" y="${yPos - 6}" text-anchor="middle" class="chart-text" font-weight="600" fill="#f3f4f6">${data.hours.toFixed(1)}</text>`;
      }

      // X-Axis Label
      svg += `<text x="${xPos + barWidth / 2}" y="${height - 6}" text-anchor="middle" class="chart-text" font-weight="500">${data.label}</text>`;
    });

    // Draw Bottom Axis line
    svg += `<line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="chart-axis-line" />`;

    svg += `</svg>`;
    container.innerHTML = svg;
  },

  /**
   * Renders the monthly trend line chart (last 30 days)
   */
  renderMonthlyChart(containerId, history) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Prepare Data (last 30 days)
    const daysData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      
      // Calculate total duration for this date string in history
      const dayLogs = history.filter(log => log.date === dateString);
      let totalMs = 0;
      dayLogs.forEach(log => {
        totalMs += log.duration || 0;
      });
      const hours = Math.round((totalMs / 3600000) * 10) / 10;

      daysData.push({
        dayNum: dayNum,
        hours: hours,
        dateStr: dateString
      });
    }

    // 2. Chart Layout Params
    const width = container.clientWidth || 340;
    const height = 180;
    const paddingLeft = 30;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 25;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const maxVal = Math.max(...daysData.map(d => d.hours), 8);

    // 3. Generate SVG String
    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Area Under Line Gradient -->
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
    `;

    // Draw Grid Lines (Y-Axis ticks)
    const gridTicks = 4;
    for (let i = 0; i <= gridTicks; i++) {
      const yVal = maxVal * (i / gridTicks);
      const yPos = height - paddingBottom - (yVal / maxVal) * chartHeight;
      svg += `<line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" class="chart-grid-line" />`;
      svg += `<text x="${paddingLeft - 8}" y="${yPos + 4}" text-anchor="end" class="chart-text">${Math.round(yVal)}h</text>`;
    }

    // Compute coordinate points
    const points = [];
    const spacing = chartWidth / (daysData.length - 1);
    
    daysData.forEach((data, index) => {
      const x = paddingLeft + (index * spacing);
      const y = height - paddingBottom - (data.hours / maxVal) * chartHeight;
      points.push({ x, y, data });
    });

    // Generate path data (Line)
    let pathD = '';
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

    // Draw Area under line
    svg += `<path d="${areaD}" class="chart-area" />`;

    // Draw Line
    svg += `<path d="${pathD}" class="chart-line" />`;

    // Draw Interactive Points (render fewer labels or only on hover)
    points.forEach((pt, index) => {
      // Draw dots only for days with actual work hours to keep it clean, or every 5th day to avoid cluttering
      const showPoint = pt.data.hours > 0 || index % 5 === 0;
      
      if (showPoint) {
        svg += `<circle cx="${pt.x}" cy="${pt.y}" r="4" class="chart-point">
          <title>${pt.data.dateStr}: ${pt.data.hours} Std.</title>
        </circle>`;
      }
      
      // X-Axis Labels (every 5th day + last day)
      if (index % 5 === 0 || index === points.length - 1) {
        svg += `<text x="${pt.x}" y="${height - 6}" text-anchor="middle" class="chart-text">${pt.data.dayNum}</text>`;
      }
    });

    // Draw Bottom Axis line
    svg += `<line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" class="chart-axis-line" />`;

    svg += `</svg>`;
    container.innerHTML = svg;
  }
};

window.chartService = chartService;
