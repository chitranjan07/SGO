const provinceGroups = [
  ["Ontario", "Quebec", "British Columbia"],
  ["Alberta", "Manitoba", "Saskatchewan"],
  ["Nova Scotia", "New Brunswick", "Newfoundland"],
  ["Prince Edward Island", "Yukon", "Nunavut", "Northwest Territories"]
];

const colors = [
  "#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#1abc9c", "#f1c40f",
  "#34495e", "#95a5a6", "#d35400", "#8e44ad", "#16a085", "#c0392b", "#7f8c8d"
];

let voltageCharts = [], amperageCharts = [];
let voltageSlide = 0, amperageSlide = 0;

function setupGroupedCharts(containerId, type, chartsArray) {
  const container = document.getElementById(containerId);
  provinceGroups.forEach((group, idx) => {
    const canvas = document.createElement("canvas");
    canvas.className = `${type}-slide line-slide`;
    canvas.style.display = idx === 0 ? "block" : "none";
    container.appendChild(canvas);

    const datasets = group.map((name, i) => ({
      label: `${name} ${type === 'voltage' ? 'Voltage' : 'Amperage'}`,
      data: [],
      borderColor: colors[i + idx * 3],
      fill: false
    }));

    const chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: Array.from({ length: 10 }, (_, i) => i),
        datasets: datasets
      },
      options: {
        responsive: true,
        animation: false
      }
    });
    chartsArray.push(chart);
  });
}

function updateGroupedCharts(charts, type) {
  provinceGroups.forEach((group, idx) => {
    group.forEach((_, i) => {
      const v = Math.floor(Math.random() * 61 + 190); // 190-250
      const a = Math.floor(Math.random() * 16 + 5);   // 5-20
      const value = type === 'voltage' ? v : a;
      const dataset = charts[idx].data.datasets[i];
      dataset.data.push(value);
      if (dataset.data.length > 10) dataset.data.shift();
    });
    charts[idx].update();
  });
}

function updateTableAndAlarms() {
  let rows = "", alarms = [];
  let i = 0;
  provinceGroups.flat().forEach(province => {
    const v = Math.floor(Math.random() * 61 + 190);
    const a = Math.floor(Math.random() * 16 + 5);
    const w = (v * a).toFixed(2);
    rows += `<tr><td>${province}</td><td>Region ${++i}</td><td>${v}</td><td>${a}</td><td>${w}</td></tr>`;
    if (v > 240 || v < 200) alarms.push(`⚠️ ${province} Voltage out of range: ${v} V`);
    if (a > 18) alarms.push(`⚠️ ${province} Amperage high: ${a} A`);
  });
  document.getElementById("meterData").innerHTML = rows;
  document.getElementById("alarmList").innerHTML = alarms.length ? alarms.map(a => `<li>${a}</li>`).join("") : `<li>✅ All systems normal</li>`;
}

function updateCounters() {
  let total = 0, peakV = 0, peakA = 0;
  for (const chart of voltageCharts) {
    for (const dataset of chart.data.datasets) {
      const latest = dataset.data[dataset.data.length - 1] || 0;
      peakV = Math.max(peakV, latest);
    }
  }
  for (const chart of amperageCharts) {
    for (const dataset of chart.data.datasets) {
      const latest = dataset.data[dataset.data.length - 1] || 0;
      peakA = Math.max(peakA, latest);
    }
  }
  total = peakV * peakA;
  animateValue("totalEnergy", +document.getElementById("totalEnergy").innerText, total, 1000);
  animateValue("peakVoltage", +document.getElementById("peakVoltage").innerText, peakV, 1000);
  animateValue("peakAmperage", +document.getElementById("peakAmperage").innerText, peakA, 1000);
}

function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  let startTime = null;
  const step = timestamp => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    obj.innerText = Math.floor(progress * (end - start) + start);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function showVoltageSlide(dir) {
  const slides = document.querySelectorAll(".voltage-slide");
  slides[voltageSlide].style.display = "none";
  voltageSlide = (voltageSlide + dir + slides.length) % slides.length;
  slides[voltageSlide].style.display = "block";
}

function showAmperageSlide(dir) {
  const slides = document.querySelectorAll(".amperage-slide");
  slides[amperageSlide].style.display = "none";
  amperageSlide = (amperageSlide + dir + slides.length) % slides.length;
  slides[amperageSlide].style.display = "block";
}

function showSlide(dir) {
  const slides = document.querySelectorAll(".pie-slide");
  slides[currentPieSlide].style.display = "none";
  currentPieSlide = (currentPieSlide + dir + slides.length) % slides.length;
  slides[currentPieSlide].style.display = "block";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

setupGroupedCharts("voltageChartContainer", "voltage", voltageCharts);
setupGroupedCharts("amperageChartContainer", "amperage", amperageCharts);

setInterval(() => {
  updateGroupedCharts(voltageCharts, "voltage");
  updateGroupedCharts(amperageCharts, "amperage");
  updateTableAndAlarms();
  updateCounters();
}, 2000);

const pieCharts = [
  new Chart(document.getElementById("pie1"), {
    type: "pie",
    data: {
      labels: ["Ontario", "Quebec", "British Columbia"],
      datasets: [{ data: [420, 370, 340], backgroundColor: colors }]
    }
  }),
  new Chart(document.getElementById("pie2"), {
    type: "pie",
    data: {
      labels: ["Alberta", "Manitoba", "Saskatchewan"],
      datasets: [{ data: [320, 290, 270], backgroundColor: colors }]
    }
  }),
  new Chart(document.getElementById("pie3"), {
    type: "pie",
    data: {
      labels: ["Nova Scotia", "New Brunswick", "Newfoundland"],
      datasets: [{ data: [250, 230, 210], backgroundColor: colors }]
    }
  }),
  new Chart(document.getElementById("pie4"), {
    type: "pie",
    data: {
      labels: ["Prince Edward Island", "Yukon", "Nunavut", "Northwest Territories"],
      datasets: [{ data: [180, 160, 140, 120], backgroundColor: colors }]
    }
  })
];

let currentPieSlide = 0;
