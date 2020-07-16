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
  props: ["id", "fields", "alias", "chartData", "formatter"],
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
  computed: {
    spacesMap() {
      const map = {};
      for (const space of this.chartData) {
        const change = Math.abs(space.change);
        if (map[space.space]) {
          if (map[space.space].maxChange < change) {
            map[space.space].maxChange = change;
          }
        } else {
          map[space.space] = { maxChange: change };
        }
      }
      return map;
    }
  },
  methods: {
    drawChart() {
      if (!this.chartData) {
        return;
      }
      this.chart = new G2.Chart({
        container: this.id,
        forceFit: true,
        height: 300,
        animate: false,
        padding: ["-5%", "2%", "10%", "20%"]
      });

      this.chart.source(this.chartData);

      this.chart.legend(false);

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

      this.chart.scale(this.fields[1], {
        alias: this.alias[this.fields[1]]
      });

      this.chart.axis(this.fields[1], {
        label: {
          offset: 17,
          textStyle: {
            fill: "#aaaaaa"
          }
        },
        title: {
          offset: 172
        },
        grid: {
          hideLastLine: true
        }
      });

      this.chart.tooltip({ showTitle: false });

      this.chart
        .point()
        .position(`${this.fields[0]}*${this.fields[1]}`)
        .color(this.fields[2], value => {
          if (value > 0) {
            return "#f3a1a1";
          } else {
            return "#adbcc9";
          }
        })
        .size(`${this.fields[1]}*${this.fields[2]}`, (space, change) => {
          const maxSize = 15;
          const minSize = 3;
          const size = Math.round(
            maxSize * (Math.abs(change) / this.spacesMap[space].maxChange)
          );
          return size < minSize ? minSize : size;
        })
        .opacity(this.fields[2], value => {
          if (value === 0) {
            return 0;
          } else {
            return 0.6;
          }
        })
        .shape("circle")
        .tooltip(
          `${this.fields[2]}*${this.fields[0]}*${this.fields[1]}`,
          (d, x, y) => {
            return {
              name: y,
              value: this.formatter(d)
            };
          }
        );

      this.chart.render();

      this.chart.on("plotclick", ev => {
        const data = ev.data && ev.data._origin;
        if (data && data.index) {
          this.$emit("clickGcObject", data);
        }
      });
    }
  }
};
</script>
