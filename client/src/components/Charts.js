import React, { Component } from "react";
import "../../node_modules/react-vis/dist/style.css";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalBarSeries,
  DiscreteColorLegend
} from "react-vis";
import UserContext from "../context/UserContext.js";

class Charts extends Component {
  static contextType = UserContext;

  render() {
    const gaData = [
      { x: "Needs", y: 50 },
      { x: "Wants", y: 30 },
      { x: "Savings", y: 20 }
    ];
    
    const { needs = 0, wants = 0, savings = 0 } = this.context.user ? this.context.user.categories : {};
    const userGraphData = [
      { x: "Needs", y: `${needs}` },
      { x: "Wants", y: `${wants}` },
      { x: "Savings", y: `${savings}` }
    ];

    return (      
      <div className="App">
        <XYPlot margin={{ bottom: 70 }} xType="ordinal" height={300} width={800} yDomain={[0, 100]}>
          <DiscreteColorLegend
            style={{ position: "absolute", left: "300px", top: "10px" }}
            orientation='vertical'
            items={[
              {
                title: "GA Average",
                color: "red"
              },
              {
                title: "You",
                color: "purple"
              }
            ]}
          />

          <XAxis tickLabelAngle={-45} />
          <YAxis />
          <VerticalBarSeries data={gaData} color='red' />
          <VerticalBarSeries data={userGraphData} color='purple' />
        </XYPlot>
      </div>
    );
  }
}

export default Charts;
