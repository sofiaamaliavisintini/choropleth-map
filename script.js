const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const width = 1000, height = 600, padding = 60;

const svg = d3.select("#choropleth")
              .attr("width", width)
              .attr("height", height);

const tooltip = d3.select("#tooltip");

Promise.all([d3.json(countyURL), d3.json(educationURL)]).then(([countyData, educationData]) => {
    const counties = topojson.feature(countyData, countyData.objects.counties).features;
    
    const educationMap = new Map(educationData.map(d => [d.fips, d]));

    const colorScale = d3.scaleQuantize()
        .domain(d3.extent(educationData, d => d.bachelorsOrHigher))
        .range(["#f7fcf0", "#ccece6", "#99d8c9", "#66c2a4", "#2ca25f", "#006d2c"]);

    svg.append("g")
       .selectAll("path")
       .data(counties)
       .enter()
       .append("path")
       .attr("class", "county")
       .attr("d", d3.geoPath())
       .attr("fill", d => {
           const data = educationMap.get(d.id);
           return data ? colorScale(data.bachelorsOrHigher) : "#ccc";
       })
       .attr("data-fips", d => d.id)
       .attr("data-education", d => educationMap.get(d.id)?.bachelorsOrHigher || 0)
       .on("mouseover", (event, d) => {
           const data = educationMap.get(d.id);
           tooltip.style("opacity", 1)
                  .style("left", `${event.pageX + 10}px`)
                  .style("top", `${event.pageY - 20}px`)
                  .attr("data-education", data?.bachelorsOrHigher || 0)
                  .html(`${data?.area_name}, ${data?.state}: ${data?.bachelorsOrHigher}%`);
       })
       .on("mouseout", () => tooltip.style("opacity", 0));

    // Leyenda
    const legend = d3.select("#legend")
        .attr("width", 400)
        .attr("height", 50);

    legend.selectAll("rect")
          .data(colorScale.range())
          .enter()
          .append("rect")
          .attr("x", (d, i) => i * 50)
          .attr("width", 50)
          .attr("height", 20)
          .attr("fill", d => d);
});
