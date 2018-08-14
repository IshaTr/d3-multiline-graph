import React, { Component } from 'react';
import '../App.css';
import { select } from 'd3-selection';
import * as d3 from "d3";

class Graph extends Component {
  constructor(props) {
    super(props);
    this.createChart = this.createChart.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate() {
    this.createChart();
  }

  createChart = () => {
    let data = [];
    data = data.concat(this.props.data[0])
    let margin = { top: 10, right: 20, bottom: 30, left: 30 };
    let width = 1300 - margin.left - margin.right;
    let height = 565 - margin.top - margin.bottom;
    const div = select('body').append('div')
                      .attr('class', 'tooltip')
                      .style('opacity', 0)

    let node = select(this.node)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    let parseTime = d3.timeParse('%Y/%m/%d');
    // console.log('console date', parseTime('2016/09/30'))

    data.forEach(company => {
      company.values.forEach(d => {
        // console.log('prev date', d.date)
        d.date = parseTime(d.date);
        // console.log('converted date', d.date)
        d.close = +d.close;
      });
    });

    var bisectDate = d3.bisector(d => d.date).left;

    let xScale = d3.scaleTime()
    .domain([
      d3.min(data, co => d3.min(co.values, d => d.date)),
      // unix timestamp conversion required for number
      d3.max(data, co => d3.max(co.values, d => d.date))
    ])
    .range([0, width]);

    node
      .append('g')
        .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(5));

      var yScale = d3.scaleLinear()
        .domain([
          d3.min(data, co => d3.min(co.values, d => d.close)),
          d3.max(data, co => d3.max(co.values, d => d.close))
        ])
        .range([height, 0]);
      node
        .append('g')
        .call(d3.axisLeft(yScale));

      const area = d3.area()
        .x(d => xScale(d.date))
        .y0(yScale(yScale.domain()[0]))
        .y1(d => yScale(d.close))
        // .curve(d3.curveCatmullRom.alpha(0.5));


        const circles = (circleData) => {
          return node.selectAll('circle')
                    .data(circleData)
                    .enter()
                    .append('svg:circle')
        }

        let browser = node.selectAll(".browser")
                      .data(data)
                      .enter().append("g")
                      .attr("class", "browser");

        browser.append("path")
          .attr("class", "area")
          .attr("d", (d) => { return area(d.values); })
          .style("fill", "green");

          var focus = node.append("g")
          .attr("class", "focus")
          .style("display", "none");

        focus.append("circle")
            .attr("r", 4.5);

        focus.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");

        node.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .attr("opacity", 0)
            .on("mouseover", () => { focus.style("display", null); })
            .on("mouseout", () => { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        const mousemove = () => {
          var x0 = xScale.invert(d3.mouse(this)[0]),
              i = bisectDate(data, x0, 1),
              d0 = data[i - 1],
              d1 = data[i],
              d = x0 - d0.date > d1.date - x0 ? d1 : d0;
          console.log('x0', x0)
          focus.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d.close) + ")");
          focus.select("text").text(d.close);
        }

        // // plotting circles for graph
        // node.selectAll("dot")
        // .data(data[0].values)
        // .enter().append('circle')
        //   .attr('r', 5)
        //   // xScale/yScale is used for converting the response value to scale value
        //   .attr('cx', value => { return xScale(value.date); })
        //   .attr('cy', value => { return yScale(value.close); })
        //   .attr('fill', 'white')
        //   .attr('stroke', 'red')
        //   .attr('stroke-width', 2)
        //   .attr('opacity', 0)
        //   .on('mouseover', (d) => {
        //     div.transition()
        //         .duration(200)
        //         .style('opacity', 0.9);
        //     div.html((d.date) + '<br/>'  + d.close)
        //         .style('left', (d3.event.pageX) + 'px')
        //         .style('top', (d3.event.pageY - 28) + 'px');
        //   })
      // })

      // node
      //   .selectAll('.area')
      //   .data(data)
      //   .enter()
      //   .append('path')
      //   .attr('class', 'area')
      //   .attr('d', d => area(d.values))
      //   .style('stroke', (d, i) => ['#FF9900', '#3369E8'][i])
      //   .style('stroke-width', 2)
      //   .style('fill', (d, i) => ['#FF9900', '#3369E8'][i])
      //   .style('fill-opacity', 0.5)
      //   .on("mouseover", (d, i) => {
      //     // console.log({"x": d3.event.x, "y": d3.event.y});\
      //   });

  }

  render() {
    return(
      <svg
        ref={node => this.node = node}
        width={500}
        height={500}
      ></svg>
    );
  }
}

export default Graph;