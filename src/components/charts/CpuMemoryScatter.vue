<template>
  <div>
    <div :style="`margin-left:${width / 2 - 130}px`">X轴: RSS / MB, Y轴: CPU / %</div>
    <div :id="id" style="margin-left:-65px"></div>
  </div>
</template>

<script>
import G2 from "@antv/g2";
import * as common from "../../javascript/common";

export default {
  data() {
    return {
      chart: null
    };
  },
  props: {
    charData: {
      type: Array,
      default: function() {
        return {
          data: []
        };
      }
    },
    id: String,
    width: Number
  },
  mounted() {
    this.drawChart();
  },
  watch: {
    charData: function(val, oldVal) {
      if (this.chart) {
        this.chart.source(this.charData);
        this.chart.render();
      } else {
        this.drawChart();
      }
    },
    width: function(val, oldVal) {
      if (this.chart) {
        this.chart.source(this.charData);
        this.chart.render();
      } else {
        this.drawChart();
      }
    }
  },
  methods: {
    drawChart: function() {
      if (!this.width) return;
      this.chart = new G2.Chart({
        container: this.id,
        width: this.width,
        height: 400
      });
      this.chart.source(this.charData);
      this.chart.tooltip({
        showTitle: false,
        crosshairs: {
          type: "cross"
        },
        itemTpl:
          '<li data-index={index} style="margin-bottom:4px;text-align:left">' +
          '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' +
          "pid: {pid}<br/>" +
          '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' +
          "cpu: {cpu}, " +
          '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' +
          "memory: {memory}" +
          "</li>"
      });
      this.chart
        .point()
        .position("memory*cpu")
        .size(4)
        .shape("circle")
        .opacity(0.65)
        .tooltip("pid*memory*cpu", function(pid, memory, cpu) {
          return {
            pid,
            cpu: cpu + " %",
            memory: common.formatMemory(memory * 1024 * 1024)
          };
        });
      this.chart.render();
    }
  }
};
</script>
