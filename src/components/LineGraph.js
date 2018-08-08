import React, { Component } from 'react';
import '../App.css';
import { select } from 'd3-selection';
import * as d3 from "d3";

class LineGraph extends Component {
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
    const data = this.props.data;
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
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });

    let xScale = d3.scaleTime()
    .domain([
      d3.min(data, co => d3.min(co.values, d =>  {
        console.log(d.date)
        return d.date
      })),
      d3.max(data, co => d3.max(co.values, d => d.date))
    ])
    .range([0, width]);

    node
      .append('g')
        .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(5));

      var yScale = d3.scaleLinear()
        .domain([
          d3.min(data, co => d3.min(co.values, d =>{
            console.log(d.close);
            return d.close
          })),
          d3.max(data, co => d3.max(co.values, d => d.close))
        ])
        .range([height, 0]);
      node
        .append('g')
        .call(d3.axisLeft(yScale));
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

export default LineGraph;