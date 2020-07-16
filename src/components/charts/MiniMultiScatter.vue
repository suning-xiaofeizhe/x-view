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
      chart: null
    };
  },
  props: ["id", "fields", "types", "chartData", "showColor"],
  mounted() {
    if (!this.chart) {
      this.drawChart();
    }
  },
  watch: {
    chartData() {
      if (this.chartData) {
        if (this.chart) {
          this.chart.changeData(this.chartData);
          this.chart.repaint();
        } else {
          this.drawChart();
        }
      }
    }
  },
  methods: {
    color(name) {
      return this.showColor;
    },

    drawChart() {
      if (!this.chartData) {
        return;
      }
      this.chart = new G2.Chart({
        container: this.id,
        forceFit: true,
        height: 100,
        padding: [21, "25%", 45, "25%"],
        animate: false
      });
      this.chart.source(this.chartData, {
        // [this.fields[0]]: {
        //   min: 0
        // }
      });
      this.chart.legend(false);
      // eg. time*name*type
      this.chart.axis(this.fields[1], {
        grid: null,
        label: null
      });
      this.chart.axis(this.fields[0], {
        tickLine: {
          length: -5
        }
        // title: {
        //   position: "end",
        //   offset: -17,
        //   textStyle: {
        //     textAlign: "center",
        //     fill: "#404040"
        //   }
        // }
      });
      this.chart.scale(this.fields[0], {
        tickCount: 5
      });
      // this.chart.tooltip({ showTitle: false });
      this.chart.tooltip(false);
      this.chart.on("plotclick", ev => {
        const data = ev.data && ev.data._origin;
        if (data && data.index) {
          this.$emit("clickGcObject", data);
        }
      });
      this.chart
        .point()
        .position(`${this.fields[0]}*${this.fields[1]}`)
        .color(this.fields[2], this.color)
        .size(4)
        .opacity(0.3)
        .shape("circle")
        .tooltip(
          `${this.fields[2]}*${this.fields[0]}*${this.fields[1]}`,
          (d, x, y) => {
            return {
              name: d,
              value: x + "ms"
            };
          }
        );

      this.chart.render();
    }
  }
};
</script>
