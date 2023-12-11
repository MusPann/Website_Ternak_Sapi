import React, { Component } from "react";
import PropTypes from "prop-types";
import echarts from "echarts/lib/echarts";
import { debounce } from "@/utils";
import { getPeternaks } from "@/api/peternak"; // Import the getPeternaks API function

class BarChart extends Component {
  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    className: PropTypes.string,
    styles: PropTypes.object,
  };

  static defaultProps = {
    width: "100%",
    height: "300px",
    styles: {},
    className: "",
  };

  state = {
    chart: null,
    peternaks: [], // Store peternaks data retrieved from the API
  };

  componentDidMount() {
    this.fetchPeternaks(); // Fetch peternak data when the component mounts
    debounce(this.initChart.bind(this), 300)();
    window.addEventListener("resize", () => this.resize());
  }

  componentWillUnmount() {
    this.dispose();
  }

  resize() {
    const chart = this.state.chart;
    if (chart) {
      debounce(chart.resize.bind(this), 300)();
    }
  }

  dispose() {
    if (!this.state.chart) {
      return;
    }
    window.removeEventListener("resize", () => this.resize());
    this.setState({ chart: null });
  }

  fetchPeternaks() {
    // Use the getPeternaks API function to retrieve peternak data
    getPeternaks()
      .then((response) => {
        const { content, statusCode } = response.data;
        if (statusCode === 200) {
          this.setState({ peternaks: content }, () => {
            // After fetching data, initialize the chart
            debounce(this.initChart.bind(this), 300)();
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching peternak data:", error);
      });
  }

  setOptions() {
    const { peternaks } = this.state;
    const registrationsPerDay = {};

    // Calculate the number of registrations per day
    peternaks.forEach((peternak) => {
      const date = new Date(peternak.tanggalPendaftaran);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // Month is 0-based, so add 1 to get the correct month
      const day = date.getDate();

      // Create a unique key for each day (e.g., "2023-01-15" for January 15, 2023)
      const dayKey = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      if (!registrationsPerDay[dayKey]) {
        registrationsPerDay[dayKey] = 1;
      } else {
        registrationsPerDay[dayKey]++;
      }
    });

    // Extract the unique days and sort them
    const days = Object.keys(registrationsPerDay).sort();

    // Extract the number of registrations for each day in sorted order
    const registrationCounts = days.map((day) => registrationsPerDay[day]);

    this.state.chart.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        top: 10,
        left: "2%",
        right: "2%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: days,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          axisTick: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Registrations",
          type: "bar",
          barWidth: "60%",
          data: registrationCounts,
          animationDuration: 3000,
        },
      ],
    });
  }

  initChart() {
    if (!this.el) return;
    this.setState({ chart: echarts.init(this.el, "macarons") }, () => {
      this.setOptions();
    });
  }

  render() {
    const { className, height, width, styles } = this.props;
    return (
      <div
        className={className}
        ref={(el) => (this.el = el)}
        style={{
          ...styles,
          height,
          width,
        }}
      />
    );
  }
}

export default BarChart;
