<template>
  <div>
    <div :id="id"></div>
  </div>
</template>

<script>
import G2 from "@antv/g2";
import DataSet from "@antv/data-set";

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
  props: ["id", "status", "fields", "chartData", "careKey", "formatter"],
  mounted() {
    if (!this.chart) {
      this.drawChart();
    }
  },
  beforeDestroy() {
    this.$emit("clearChart", { id: this.id });
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

    drawChart() {
      if (!this.chartData) {
        return;
      }
      const dv = new DataSet.View().source(this.chartData);
      dv.transform({
        type: "fold",
        fields: this.fields,
        key: "type",
        value: "value"
      });
      this.chart = new G2.Chart({
        container: this.id,
        forceFit: true,
        height: 400,
        animate: false
      });
      this.chart.source(dv, {
        min: {
          type: "time",
          tickCount: 12,
          mask: "HH:mm",
          range: [0, 1]
        },
        value: {
          min: 0,
          formatter: this.formatter
        }
      });
      // this.chart.axis("value", {
      //   grid: null
      // });
      this.chart.tooltip({
        crosshairs: true,
        htmlContent: (title, items) => {
          const html =
            '<div style="position:absolute;visibility:hidden;z-index:8;' +
            "transition:cubic-bezier(0.23, 1, 0.32, 1), left 0.4s cubic-bezier(0.23, 1, 0.32, 1), top 0.4s cubic-bezier(0.23, 1, 0.32, 1);" +
            "background-color: rgba(255, 255, 255, 0.9);box-shadow: 0px 0px 10px #aeaeae;border-radius:3px;color:rgb(87, 87, 87);" +
            'font-size:12px;font-family:r;line-height:20px;padding:10px 10px 6px 10px;">';
          const titleDom =
            '<div style="margin-bottom: 4px;">' + title + "</div>";
          let listDom = '<ul style="margin:0;list-style-type:none;padding:0;">';
          let sum = 0;
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemDom =
              "<li>" +
              '<span style="background-color:' +
              item.color +
              ';width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
              item.name +
              '<span style="display:inline-block;float:right;margin-left:30px;">' +
              (this.showOriginValue ? item.point._origin.value : item.value) +
              "</span>" +
              "</li>";
            listDom += itemDom;
            if (this.careKey.includes(item.name)) {
              this.$emit("shouldCareValue", item.value);
              sum += parseFloat(item.value);
            }
          }
          this.$emit("shouldCareSumValue", sum);
          listDom += "</ul>";
          return html + titleDom + listDom + "</div>";
        }
      });
      this.chart
        .area()
        .position("min*value")
        .color("type", this.color)
        .opacity(0.4);
      // .shape("smooth");
      this.chart
        .line()
        .position("min*value")
        .color("type", this.color)
        .opacity(0.8)
        .size(1);
      // .shape("smooth");
      this.chart.render();

      this.$emit("pushChart", { chart: this.chart, id: this.id });
      this.chart.on("plotmove", ev => {
        const position = {
          x: ev.x,
          y: ev.y
        };
        const record = this.chart.getSnapRecords(position);
        if (record.length) {
          const min = record[0]._origin.min;
          this.$emit("plotmove", { min });
        }
      });
      this.chart.on("plotleave", () => this.$emit("plotleave"));
    }
  },
  computed: {
    showOriginValue() {
      const list = [
        "process-handle-detail",
        "process-timer-detail",
        "process-tcp-detail"
      ];
      return list.includes(this.id);
    }
  }
};
</script>
