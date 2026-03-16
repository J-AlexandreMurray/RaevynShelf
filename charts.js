
let genreChart;
let timeChart;

function renderCharts(){

const genreCounts = {};
const monthCounts = {};

books.forEach(book => {

if(book.tags){
const tags = book.tags.split(",").map(t => t.trim()).filter(Boolean);
tags.forEach(tag => {
genreCounts[tag] = (genreCounts[tag] || 0) + 1;
});
}

if(book.status === "read"){
const date = new Date(book.dateFinished);
const key = date.getFullYear() + "-" + (date.getMonth()+1);
monthCounts[key] = (monthCounts[key] || 0) + 1;
}

});

const genreLabels = Object.keys(genreCounts);
const genreData = Object.values(genreCounts);

if(genreChart) genreChart.destroy();

genreChart = new Chart(
document.getElementById("genreChart"),
{
type: "pie",
data: {
labels: genreLabels,
datasets: [{data: genreData}]
}
}
);

const timeLabels = Object.keys(monthCounts);
const timeData = Object.values(monthCounts);

if(timeChart) timeChart.destroy();

timeChart = new Chart(
document.getElementById("timeChart"),
{
type: "bar",
data: {
labels: timeLabels,
datasets: [{
label: "Books Read",
data: timeData
}]
}
}
);

}
