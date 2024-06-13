import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
// const g = svg.append("g"); // group

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 25, right: 20, bottom: 60, left: 70 };

// parsing & formatting
const formatXAxis = d3.format("~s"); //숫자를 간결하게 표현하기 위한 포매팅 방식 (K, M)

// scale
const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
// const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
const radiusScale = d3.scaleSqrt().range([0, 90]);
const colorScale = d3
    .scaleOrdinal()
    .range(["#6a0d83", "#ce4993", "#ee5d6c", "#eeaf61"]); // #ccc

// axis
const xAxis = d3
    .axisBottom(xScale)
    .tickFormat((d) => formatXAxis(d))
    .tickValues([0, 1000000, 2000000, 3000000, 4000000]);

const yAxis = d3.axisLeft(yScale).ticks(7);

//  tooltip
const tooltip = d3
    .select("#svg-container")
    .append("div")
    .attr("class", "tooltip");

// svg elements
let circles, xUnit, yUnit, legendRects, legendTexts;

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
let data = [];
let region;

d3.csv("data/gapminder_combined.csv").then((raw_data) => {
    // data parsing
    data = raw_data.map((d) => {
        d.production = +d.production;
        d.consumption = +d.consumption;
        d.population = +d.population;
        d.country = d.country;
        return d;
    });

    region = [...new Set(data.map((d) => d.region))];

    // scale updated
    xScale.domain([0, 4000000]);
    yScale.domain([d3.min(data, (d) => d.consumption), 6]);
    radiusScale.domain([0, d3.max(data, (d) => d.population)]);

    // axis updated
    svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);

    // draw circles
    circles = svg
        .selectAll("circles")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.production))
        .attr("cy", (d) => yScale(d.consumption))
        .attr("r", (d) => radiusScale(d.population))
        .attr("fill", (d) => colorScale(d.region))
        .attr("stroke", "#fff")
        .on("mousemove", function (event, d, index) {
            tooltip
                .style("left", event.pageX + 0 + "px")
                .style("top", event.pageY - 52 + "px")
                .style("display", "block")
                .html(`${d.country},${d.production}`);

            d3.select(this).style("stroke-width", 4).attr("stroke", "#111");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this).style("stroke-width", 1).attr("stroke", "#fff");
        });

    // Units
    xUnit = svg
        .append("text")
        .attr("transform", `translate(${width / 2}, ${height - 10})`)
        .text("Production")
        .attr("class", "unit");
        

    yUnit = svg
        .append("text")
        .attr("transform", "translate(20," + height / 2 + ") rotate(-90)")
        .text("Consumption")
        .attr("class", "unit");

    // Legend
    legendRects = svg
        .selectAll("legend-rects")
        .data(region)
        .enter()
        .append("rect")
        .attr("x", (d, i) => width - margin.right - 83)
        .attr("y", (d, i) => height - margin.bottom - 70 - 25 * i)
        .attr("width", 12)
        .attr("height", 17)
        .attr("fill", (d) => colorScale(d));

    legendTexts = svg
        .selectAll("legend-texts")
        .data(region)
        .enter()
        .append("text")
        .attr("x", (d, i) => width - margin.right - 83 + 20)
        .attr("y", (d, i) => height - margin.bottom - 70 - 25 * i + 15)
        .text((d) => d)
        .attr("class", "legend-texts");
})
    .catch((error) => {
        console.error("Error loading CSV data: ", error);
    });

////////////////////////////////////////////////////////////////////
////////////////////////////  Resize  //////////////////////////////
window.addEventListener("resize", () => {
    //  width, height updated
    width = parseInt(d3.select("#svg-container").style("width"));
    height = parseInt(d3.select("#svg-container").style("height"));

    //  scale updated
    xScale.range([margin.left, width - margin.right]);
    yScale.range([height - margin.bottom, margin.top]);

    //  axis updated
    d3.select(".x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    d3.select(".y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);

    // circles updated
    circles
        .attr("cx", (d) => xScale(d.production))
        .attr("cy", (d) => yScale(d.consumption))
        .attr("r", (d) => radiusScale(d.population));

    // units updated
    xUnit.attr("transform", `translate(${width / 2}, ${height - 10})`);
    yUnit.attr("transform", "translate(20," + height / 2 + ") rotate(-90)");

    //  legend updated
    legendRects
        .attr("x", (d, i) => width - margin.right - 83)
        .attr("y", (d, i) => height - margin.bottom - 70 - 25 * i);

    legendTexts
        .attr("x", (d, i) => width - margin.right - 83 + 20)
        .attr("y", (d, i) => height - margin.bottom - 70 - 25 * i + 15);
});
