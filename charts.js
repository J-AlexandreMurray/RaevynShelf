let statusChart;
let ratingChart;
let tagChart;
let recentChart;

function destroyChart(chart){
  if(chart){
    chart.destroy();
  }
}

function normalizeTag(tag){
  return tag.trim().toLowerCase();
}

function renderCharts(books){
  renderStatusChart(books);
  renderRatingChart(books);
  renderTagChart(books);
  renderRecentChart(books);
}

function renderStatusChart(books){
  const reading = books.filter(b => b.status === "reading").length;
  const read = books.filter(b => b.status === "read").length;
  const planned = books.filter(b => b.status === "planned").length;

  destroyChart(statusChart);

  statusChart = new Chart(document.getElementById("statusChart"), {
    type: "doughnut",
    data: {
      labels: ["Reading", "Read", "Planned"],
      datasets: [{
        data: [reading, read, planned],
        backgroundColor: ["#5865f2", "#57f287", "#faa61a"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#f3f4f6" } } }
    }
  });
}

function renderRatingChart(books){
  const counts = [1,2,3,4,5].map(r => books.filter(b => Number(b.rating) === r).length);

  destroyChart(ratingChart);

  ratingChart = new Chart(document.getElementById("ratingChart"), {
    type: "bar",
    data: {
      labels: ["1","2","3","4","5"],
      datasets: [{
        label: "Ratings",
        data: counts,
        backgroundColor: "#9aa7ff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#f3f4f6" }, grid: { color: "#2a2f3a" } },
        y: { ticks: { color: "#f3f4f6", precision:0 }, grid: { color: "#2a2f3a" }, beginAtZero: true }
      },
      plugins: { legend: { labels: { color: "#f3f4f6" } } }
    }
  });
}

function renderTagChart(books){
  const tagCounts = {};

  books.forEach(book => {
    if(!book.tags) return;
    book.tags.split(",").forEach(tag => {
      const clean = normalizeTag(tag);
      if(!clean) return;
      tagCounts[clean] = (tagCounts[clean] || 0) + 1;
    });
  });

  const top = Object.entries(tagCounts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 10);

  destroyChart(tagChart);

  tagChart = new Chart(document.getElementById("tagChart"), {
    type: "bar",
    data: {
      labels: top.map(([tag]) => tag),
      datasets: [{
        label: "Top Tags",
        data: top.map(([,count]) => count),
        backgroundColor: "#ff7edb"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      scales: {
        x: { ticks: { color: "#f3f4f6", precision:0 }, grid: { color: "#2a2f3a" }, beginAtZero: true },
        y: { ticks: { color: "#f3f4f6" }, grid: { color: "#2a2f3a" } }
      },
      plugins: { legend: { display:false } }
    }
  });
}

function renderRecentChart(books){
  const now = new Date();
  const tagCounts = {};

  books.forEach(book => {
    if(book.status !== "read" || !book.dateFinished) return;
    const finished = new Date(book.dateFinished);
    const diffDays = (now - finished) / (1000 * 60 * 60 * 24);
    if(diffDays > 14) return;

    if(book.tags){
      book.tags.split(",").forEach(tag => {
        const clean = normalizeTag(tag);
        if(!clean) return;
        tagCounts[clean] = (tagCounts[clean] || 0) + 1;
      });
    }
  });

  const top = Object.entries(tagCounts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 10);

  destroyChart(recentChart);

  recentChart = new Chart(document.getElementById("recentChart"), {
    type: "bar",
    data: {
      labels: top.map(([tag]) => tag),
      datasets: [{
        label: "Last 14 Days",
        data: top.map(([,count]) => count),
        backgroundColor: "#faa61a"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#f3f4f6" }, grid: { color: "#2a2f3a" } },
        y: { ticks: { color: "#f3f4f6", precision:0 }, grid: { color: "#2a2f3a" }, beginAtZero: true }
      },
      plugins: { legend: { labels: { color: "#f3f4f6" } } }
    }
  });
}
