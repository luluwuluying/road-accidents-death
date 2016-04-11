//Width and height of map
var width_state = 960;
var height_state = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
                   .translate([width_state/2, height_state/2])    // translate to center of screen
                   .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
             .projection(projection);  // tell path generator to use albersUsa projection


// Define linear scale for output
var stateColor = d3.scale.linear()
              .range(["#fbdddf", "#f9547b"]);


//Create SVG element and append map to the SVG
var svg_state = d3.select("#vis_state")
            .append("svg")
            .attr('class', 'vis_state')
            .attr("width", width_state)
            .attr("height",height_state);

// Append Div for tooltip to SVG
var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip_state")
            .style("display", "none");

queue()
    .defer(d3.json, "json/us-states.json")
    .defer(d3.csv, "data/USstate_death2013.csv")
    .await(ready);

function ready(error, json, states, deaths) {

    stateColor.domain(d3.extent(states,function(s) { return +s.rate;})); 
    console.log(error, states, deaths);
    
    states.forEach(function(state) {
        
        var dataState = state.statename; 
        var dataValue = +state.rate; 
        
        json.features.forEach(function(j) {
            var jsonState = j.properties.name;
            if (dataState == jsonState) { 
                j.properties.rate = dataValue;
           
            }
        });
    }); // ends data merge


    // Bind the data to the SVG and create one path per GeoJSON feature
    svg_state.selectAll("path.states")
        .data(json.features)
        .enter()
        .append("path")
        .classed("states", true)
        .attr("d", path)
        .style("fill", function(d) {
            
            var value = d.properties.rate;
            return stateColor(value);
        })
        .on("mouseover", function(d) {
            div.transition()
               .duration(200)
               .style("display", null);
            div.html("<p>Death rate per 100,000 population: " + d.properties.name + "  " +   d.properties.rate + " %"+ "</p>")
               .style("left", (d3.event.pageX + 10) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
               .duration(500)
               .style("display", "none");
        });

    svg_state.append("g")
    .attr("class", "legendColors")
    .attr("transform", "translate(800, 300)"); // where we put it on the page!

    var legendColors = d3.legend.color()
    .shapeWidth(20)
    .shapePadding(0)
    .title("Death Rate")
    .labelFormat(d3.format("1f"))
    .scale(stateColor); 

    svg_state.select(".legendColors")
    .call(legendColors);


} // end ready function