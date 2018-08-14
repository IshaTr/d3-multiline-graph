import React, { Component } from 'react';
import '../App.css';
import { select } from 'd3-selection';
import * as d3 from "d3";

class LineGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matched: false,
    }
    this.createChart = this.createChart.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate() {
    this.createChart();
  }

  createChart = () => {
    const lineData = this.props.data;
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

    lineData.forEach(company => {
      company.values.forEach(d => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });


    let xScale = d3.scaleTime()
    .domain([
      d3.min(lineData, co => d3.min(co.values, d =>  {
        return d.date
      })),
      d3.max(lineData, co => d3.max(co.values, d => d.date))
    ])
    .range([0, width]);

    node
      .append('g')
        .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(5));

    let yScale = d3.scaleLinear()
      .domain([
        d3.min(lineData, co => d3.min(co.values, d =>{
          return d.close
        })),
        d3.max(lineData, co => d3.max(co.values, d => d.close))
      ])
      .range([height, 0]);
    node
      .append('g')
      .call(d3.axisLeft(yScale));

    const line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.close))

    node
      .selectAll('.line')
      .data(lineData)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(d.values))
      .style('stroke', (d, i) => ['red', 'green'][i])
      .style('stroke-width', 2)
      .style('fill', 'none');

      const objArr = [];
      lineData.map(value => {
        const name = value.ticker
        const color = value.ticker === "GOOG" ? "green" : "red";
        // console.log(name)
        value.values.map(item => {
          const newObj = {};
          // console.log(name)
          newObj.name = name;
          newObj.date = item.date;
          newObj.close = item.close;
          newObj.color = color;
          objArr.push(newObj)
        })
        return objArr;
      })
      // console.log(objArr);
      const decideColor = (value) => {
        const color = value === 'AMZN' ? 'red' : 'green';
        return color;
      }

      const circles = node.selectAll('circle')
      .data(objArr)
      .enter().append('circle')
        .attr('r', 5)
        // xScale/yScale is used for converting the response value to scale value
        .attr('cx', d => { return xScale(d.date); })
        .attr('cy', d => { return yScale(d.close); })
        .attr('stroke', d => decideColor(d.name))
        .attr('fill', "white")
        .attr('stroke-width', 2)

      const tooltip = d3.select('#tooltip');
      const tooltipLine = node.append('line');

      let tipBox = node.append('rect')
                  .attr('width', width)
                  .attr('height', height)
                  .attr('opacity', 0)
                  .on('mousemove', drawTooltip)
                  .on('mouseout', removeTooltip)

      function removeTooltip() {
        if (tooltip) tooltip.style('display', 'none');
        if (tooltipLine) tooltipLine.attr('stroke', 'none');
      }

      function drawTooltip() {
        const currentDate = new Date(((xScale.invert(d3.mouse(tipBox.node())[0])))).getTime();
        const date = new Date(((xScale.invert(d3.mouse(tipBox.node())[0]))));
        // converted value into unix timestamp
        const year = Math.floor((currentDate + 5)/ 10) * 10

        const getValue = (d, xScale, tipBox) => {
          let dateMatchingVal = null;
          d.values.map(h => {
            let date = (xScale.invert(d3.mouse(tipBox.node())[0]))
            date.setHours(0)
            date.setMinutes(0)
            date.setSeconds(0);
            if((h.date.getTime()/1000) === parseInt(date.getTime()/1000)) {
              dateMatchingVal = h.close;
            }
          });
          return dateMatchingVal;
        }

        // const setFill = (d) => {
        //   let color = null;
        //   // console.log('cx', d.date)
        //   if(d3.mouse(tipBox.node())[0] === Math.round(xScale(d.date))) {
        //     // console.log('mouse',  d3.mouse(tipBox.node())[0], 'cx', Math.round(xScale(d.date)))
        //     return decideColor(d.name)
        //   }
        //   return "white"
        // }

        const selectedCircle = circles.filter(d => {
          if(d3.mouse(tipBox.node())[0] === Math.round(xScale(d.date))) {
            return d;
          }
        })

        const unselectedCircle = circles.filter(d => {
          if(d3.mouse(tipBox.node())[0] !== Math.round(xScale(d.date))) {
            return d;
          }
        })
        unselectedCircle.attr('fill', 'white')

        selectedCircle.attr('fill', (d) => {
          return d.color;
        })

        tooltipLine.attr('stroke', 'black')
          .attr('stroke-width', '10')
          .attr('opacity', '0.09')
          .attr('x1', xScale(year))
          .attr('x2', xScale(year))
          .attr('y1', 0)
          .attr('y2', height);

        tooltip
          .style('left', d3.event.pageX + 20)
          .style('top', d3.event.pageY - 20)
          // .data(lineData).enter()
          .html(null)
          .style('display', 'block')
          .style('left', (d3.event.pageX + 20) + 'px')
          .style('top', (d3.event.pageY - 20) + 'px')
          .selectAll()
          .data(lineData).enter()
          .append('div')
          .style('color', (d) => {
            if(d.ticker === "GOOG") {
              return "green"
            }
            return "red"
          })
          .html(
            d => {
              const close = getValue(d, xScale, tipBox)
              if(close === null){
                return;
              }
              if(typeof close !== undefined){
                return d.ticker + ':' + close
              }
              return null;
            }
          )
          .style('visiblity', setVisibility())
      }

      const setVisibility = () => {
        if(!this.state.matched) {
          return 'none'
        }
        return 'visible'
      }

  }

  render() {
    return(
      <div>
        <svg
          ref={node => this.node = node}
          width={500}
          height={500}
        ></svg>
        <div id='tooltip' style={{position: 'absolute', backgroundColor:'lightgray', padding: '5px' }}></div>
      </div>
    );
  }
}

export default LineGraph;