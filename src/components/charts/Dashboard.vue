<style scoped>
</style>

<template>
  <div>
    <div :id="id"></div>
  </div>
</template>

<script>
import G2 from "@antv/g2";
import insertCss from "insert-css";

export default {
  data() {
    return {
      chart: null,
      colors: {
        healthy: "#19be6b",
        warning: "#ff9900",
        error: "#ed4014"
      }
    };
  },

  props: {
    id: String,
    type: String,
    value: Number,
    status: String,
    title: String
  },

  mounted() {
    if (!this.chart) {
      this.drawChart();
    }
  },

  methods: {
    drawChart() {
      insertCss(`
        .g2-guide-html {
          width: 80px;
          height: 80px;
          vertical-align: middle;
          text-align: center;
          line-height: 0.4
        }

        .g2-guide-html .title {
          font-size: 14px;
          color: #8c8c8c;
          font-weight: 300;
          margin-top:30px;
        }

        .g2-guide-html .value {
          font-size: 18px;
          color: #000;
          font-weight: bold;
          margin-top:20px;
        }`);
      const Shape = G2.Shape;
      Shape.registerShape("point", "pointer", {
        drawShape: function drawShape(cfg, group) {
          const point = cfg.points[0];
          const center = this.parsePoint({
            x: 0,
            y: 0
          });
          const target = this.parsePoint({
            x: point.x,
            y: 0.9
          });
          const dirVec = { x: center.x - target.x, y: center.y - target.y };
          // normalize
          const length = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
          dirVec.x *= 1 / length;
          dirVec.y *= 1 / length;
          // rotate dir_vector by -90 and scale
          const angle1 = -Math.PI / 2;
          const x1 = Math.cos(angle1) * dirVec.x - Math.sin(angle1) * dirVec.y;
          const y1 = Math.sin(angle1) * dirVec.x + Math.cos(angle1) * dirVec.y;
          // rotate dir_vector by 90 and scale
          const angle2 = Math.PI / 2;
          const x2 = Math.cos(angle2) * dirVec.x - Math.sin(angle2) * dirVec.y;
          const y2 = Math.sin(angle2) * dirVec.x + Math.cos(angle2) * dirVec.y;
          // polygon vertex
          const path = [
            ["M", target.x + x1 * 1, target.y + y1 * 1],
            ["L", center.x + x1 * 3, center.y + y1 * 3],
            ["L", center.x + x2 * 3, center.y + y2 * 3],
            ["L", target.x + x2 * 1, target.y + y2 * 1],
            ["Z"]
          ];
          const tick = group.addShape("path", {
            attrs: {
              path,
              fill: cfg.color
            }
          });
          return tick;
        }
      });

      const data = [{ type: this.type, value: Number(this.value) }];
      const chart = new G2.Chart({
        container: this.id,
        forceFit: true,
        height: 200,
        padding: ["-30%", "0%", "0%", "0%"]
      });
      chart.source(data);
      chart.coord("polar", {
        startAngle: (-10 / 8) * Math.PI,
        endAngle: (2 / 8) * Math.PI,
        radius: 0.60
      });
      chart.scale("value", {
        min: 0,
        max: 1,
        tickInterval: 1,
        nice: false
      });
      chart.axis(false);

      const pregroundStroke = this.colors[this.status || "healthy"];
      const titleMessage = this.title;
      chart.facet("rect", {
        fields: ["type"],
        showTitle: false,
        eachView: function eachView(view, facet) {
          const data = facet.data[0];
          // point
          view
            .point()
            .position("value*1")
            .shape("pointer")
            .color("#d8d8d8")
            .active(false);
          // dashboard background
          view.guide().arc({
            zIndex: 0,
            top: false,
            start: [0, 1],
            end: [1, 1],
            style: {
              stroke: "#ebedf0",
              lineWidth: 10
            }
          });
          // dashboard preground
          view.guide().arc({
            zIndex: 1,
            start: [0, 1],
            end: [data.value, 1],
            style: {
              stroke: pregroundStroke,
              lineWidth: 10
            }
          });
          // dashboard info
          const percent = parseInt(data.value * 100);
          view.guide().html({
            position: ["50%", "75%"],
            html:
              "<div" +
              (titleMessage ? " title='磁盘: " + titleMessage + "'" : "") +
              ' class="g2-guide-html"><p class="title">' +
              data.type +
              '</p><p class="value">' +
              percent +
              "%</p></div>"
          });
        }
      });
      chart.render();
    }
  }
};
</script>
