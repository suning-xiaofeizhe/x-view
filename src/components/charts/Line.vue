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
  props: ["id", "fields", "alias", "showColor", "chartData", "formatter"],
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
    drawChart() {
      if (!this.chartData) {
        return;
      }
      this.chart = new G2.Chart({
        container: this.id,
        forceFit: true,
        height: 400,
        animate: false
      });

      this.chart.source(this.chartData);

      this.chart.scale(this.fields[1], {
        alias: this.alias[this.fields[1]]
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

      this.chart.axis(this.fields[1], {
        label: {
          textStyle: {
            fill: "#aaaaaa"
          }
        },
        title: {
          offset: 50
        }
      });

      this.chart.tooltip({
        htmlContent: (title, items) => {
          const html =
            '<div style="position:absolute;visibility:hidden;z-index:8;' +
            "transition:cubic-bezier(0.23, 1, 0.32, 1), left 0.4s cubic-bezier(0.23, 1, 0.32, 1), top 0.4s cubic-bezier(0.23, 1, 0.32, 1);" +
            "background-color: rgba(255, 255, 255, 0.9);box-shadow: 0px 0px 10px #aeaeae;border-radius:3px;color:rgb(87, 87, 87);" +
            'font-size:12px;font-family:r;line-height:20px;padding:10px 10px 6px 10px;">';
          let listDom = '<ul style="margin:0;list-style-type:none;padding:0;">';
          for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const type = item.point._origin.type;
            const itemDom =
              "<li>" +
              '<span style="background-color:' +
              item.color +
              ';width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
              (type === "scavenge" ? "新生代回收" : type === "marksweep" ? "老生代回收" : type === "marking" ? "增量式标记" : "未知") +
              ":" +
              '<span style="display:inline-block;float:right;margin-left:30px;">' +
              this.formatter(item.point._origin.raw) +
              "</span>" +
              "</li>";
            listDom += itemDom;
          }
          listDom += "</ul>";
          return html + listDom + "</div>";
        }
      });

      this.chart
        .line()
        .position(`${this.fields[0]}*${this.fields[1]}`)
        .size(1)
        .color(this.showColor);

      this.chart.render();

      this.$emit("pushChart", { chart: this.chart, id: this.id });

      this.chart.on("plotmove", ev => {
        const position = {
          x: ev.x,
          y: ev.y
        };
        const record = this.chart.getSnapRecords(position);
        if (record.length) {
          const data = record[0]._origin;
          const time = data.time;
          this.$emit("plotmove", { time });
          if (data.index === 0 || !isNaN(data.index)) {
            this.$emit("clickGcObject", data);
          }
        }
      });

      this.chart.on("plotleave", () => this.$emit("plotleave"));
    }
  }
};
</script>
