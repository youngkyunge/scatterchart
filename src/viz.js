import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
//////////////////////////////  Init  ///////////////////////////////
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 25, right: 20, bottom: 60, left: 70 };

// parsing & formatting
const formatXAxis = d3.format("~s");

// scale
const xScale = d3.scaleLog().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
const radiusScale = d3.scaleSqrt().range([0, 55]);
const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10);

// axis
const xAxis = d3.axisBottom(xScale).tickFormat((d) => formatXAxis(d));
const yAxis = d3.axisLeft(yScale).ticks(5);

// svg elements
let circles;

////////////////////////////////////////////////////////////////////
//////////////////////////////  Load CSV  ////////////////////////////
let data = [];

d3.csv("data/gapminder_combined.csv").then((raw_data) => {
    // data parsing
    data = raw_data.map((d) => {
        d.production = +d.production;
        d.consumption = +d.consumption;
        d.population = +d.population;
        return d;
    });

    // scale updated
    xScale.domain([d3.min(data, (d) => d.production), d3.max(data, (d) => d.production)]);
    yScale.domain([d3.min(data, (d) => d.consumption), d3.max(data, (d) => d.consumption)]);
    radiusScale.domain([0, d3.max(data, (d) => d.population)]);

    // axis updated
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .append("text")
        .attr("x", width)
        .attr("y", -6)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text("Production");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .append("text")
        .attr("x", 6)
        .attr("y", 6)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .text("Consumption");

    // draw circles
    circles = svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", (d) => xScale(d.production))
        .attr("cy", (d) => yScale(d.consumption))
        .attr("r", (d) => radiusScale(d.population))
        .attr("fill", (d) => colorScale(d.country))
        .attr("opacity", 0.7);
});
