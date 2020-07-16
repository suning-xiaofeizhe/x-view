<template>
  <div>
    <div :id="id"></div>
  </div>
</template>

<script>
import G2 from "@antv/g2";

export default {
  data() {
    return {
      chart: null,
      colors: [
        "#21618C",
        "#2980B9",
        "#3498DB",
        "#229954",
        "#52BE80",
        "#7D3C98",
        "#A569BD"
      ]
    };
  },
  props: [
    "id",
    "status",
    "fields",
    "title",
    "position",
    "chartData",
    "percentFormatter",
    "positionFormatter",
    "lableFormatter"
  ],
  mounted() {
    if (!this.chart) {
      this.drawChart();
    }
  },
  watch: {
    status() {
      if (this.status) {
        if (!this.chart) {
          this.drawChart();
        }
      }
    },
    chartData() {
      if (this.chartData) {
        if (this.chart) {
          this.chart.changeData(this.chartData);
          this.chart.repaint();
          this.showBiggestPart();
        } else {
          this.drawChart();
        }
      }
    }
  },
  methods: {
    color(name) {
      const index = this.fields.indexOf(name);
      if (index) {
        return this.colors[index % this.colors.length];
      }
    },
    showBiggestPart() {
      // let index = 0;
      // let max = 0;
      // for (let i = 0; i < this.chartData.length; i++) {
      //   const data = this.chartData[i];
      //   if (data[this.position] > max) {
      //     max = data[this.position];
      //     index = i;
      //   }
      // }
      // this.interval.setSelected(this.chartData[index]);
    },
    drawChart() {
      if (!this.chartData) {
        return;
      }
      this.chart = new G2.Chart({
        container: this.id,
        forceFit: true,
        animate: false,
        height: 400
      });
      this.chart.source(this.chartData, {
        percent: {
          formatter: this.percentFormatter
        }
      });
      this.chart.coord("theta", {
        radius: 0.75,
        innerRadius: 0.6
      });
      this.chart.tooltip({
        showTitle: false,
        itemTpl:
          '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
      });
      this.interval = this.chart
        .intervalStack()
        .position(this.position)
        .color(this.title, this.color)
        .label("percent", {
          formatter: this.lableFormatter
        })
        .tooltip(`${this.title}*${this.position}`, (title, position) => {
          return {
            name: title,
            value: this.positionFormatter(position)
          };
        })
        .style({
          lineWidth: 1,
          stroke: "#fff"
        });
      this.chart.render();
      this.showBiggestPart();
    }
  }
};
</script>
