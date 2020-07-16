<style scoped>
.ivu-menu-dark,
.ivu-layout-header {
  background: #030c1c;
}

.homeContainer .wrapper {
  padding-top: 40px;
  padding-bottom: 40px;
  text-align: center;
  vertical-align: center;
}

.xnodeProjectLogo {
  justify-content: center;
  font-size: 6em;
}

.homeSplashFade {
  background: #030c1c;
}

.homeSplashFade .buttonWrapper .button {
  color: #fff;
  border-color: #fff;
}

@font-face {
  font-family: neon-tube-wide;
  src: url(/public/fonts/xnode-tube-wide.ttf);
}

.homeContainer {
  background: #030c1c;
  color: #fff;
  padding: 20px 0;
}

.xnode-logo {
  font-family: neon-tube-wide;
  text-align: center;
}

.neon-heading,
.xnode-logo span {
  font-family: neon-tube-wide;
  display: block;
  position: relative;
  -webkit-transform: translateZ(0) translate3D(0, 0, 0);
  transform: translateZ(0) translate3D(0, 0, 0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: opacity;
}

.xnode-logo .open {
  -webkit-transform: rotate(-2deg);
  transform: rotate(-2deg);
}

.neon-heading,
.xnode-logo .open {
  color: #ffd9e2 !important;
  text-shadow: 0 0 0 transparent, 0 0 10px #ff003c,
    0 0 20px rgba(255, 0, 60, 0.5), 0 0 40px #ff003c, 0 0 100px #ff003c,
    0 0 200px #ff003c, 0 0 300px #ff003c, 0 0 500px #ff003c, 0 0 1000px #ff003c;
}

.xnode-logo .hrs {
  font-size: 0.4em;
  font-family: neon-tube-wide;
  -webkit-transform: rotate(1deg);
  transform: rotate(1deg);
}

.neon-flicker-blink {
  -webkit-animation: b 0.01s infinite alternate;
  animation: b 0.01s infinite alternate;
}

.neon-subheading {
  font-family: neon-tube-wide;
  color: #d4eaff;
  letter-spacing: 2px;
  text-shadow: 0 0 15px rgba(38, 149, 255, 0.8);
}

@-webkit-keyframes b {
  40% {
    opacity: 1;
  }

  42% {
    opacity: 0.8;
  }

  43% {
    opacity: 1;
  }

  45% {
    opacity: 0.2;
  }

  46% {
    opacity: 1;
  }
}

@keyframes b {
  30% {
    opacity: 1;
  }

  42% {
    opacity: 0.8;
  }

  43% {
    opacity: 1;
  }

  45% {
    opacity: 0.2;
  }

  46% {
    opacity: 1;
  }
}
.feature {
  font-size: 6.5em;
  background: #030c1c;
  /* min-height: 500px; */
}
.home-icon {
  color: #d4eaff;
  text-shadow: 0 0 15px rgba(38, 149, 255, 0.8);
}
.f1 {
  font-size: 0.3em;
  font-weight: bold;
  color: white;
}
.f2 {
  margin-top: 15px;
  font-size: 0.2em;
  color: white;
}
</style>

<template>
  <div class="home">
    <x-header ref="xheader" :menu-style="'background:#030c1c;'"></x-header>
    <Row class="body">
      <Row ref="xlogo" class="homeContainer">
        <div class="wrapper homeWrapper">
          <div class="xnodeProjectLogo">
            <div class="xnode-logo">
              <span class="open neon-heading neon-flicker-blink">XNPP</span>
              <span class="hrs neon-subheading">Monitoring Tool for Node.js</span>
            </div>
          </div>
        </div>
      </Row>
      <Row class="feature" :style="featureStyle" type="flex" justify="center" :gutter="24">
        <Col span="6">
          <Icon class="home-icon" type="ios-cloud-upload-outline" />
          <div class="f1">实时采集</div>
          <div class="f2">无论 JS 工作线程处于何种状况，都可以采集到 CPU / Memory / GC / Libuv 句柄信息</div>
        </Col>
        <Col span="6">
          <Icon class="home-icon" type="ios-alarm-outline" />
          <div class="f1">阈值告警</div>
          <div class="f2">基于 DSL 表达式进行阈值条件告警的设置，触发判定后通过邮件等自定义形式通知</div>
        </Col>
        <Col span="6">
          <Icon class="home-icon" type="ios-git-network" />
          <div class="f1">智能分析</div>
          <div class="f2">集成 Chromium Devtools 调试套件，辅以定制化的 XNPP 分析服务更快定位到问题所在</div>
        </Col>
      </Row>
    </Row>
  </div>
</template>

<script>
import header from "./Header";
export default {
  components: {
    "x-header": header
  },
  data() {
    return {
      featureStyle: ""
    };
  },
  mounted() {
    const winHeight = window.innerHeight;
    const used =
      parseInt(window.getComputedStyle(this.$refs.xheader.$el).height, 10) +
      parseInt(window.getComputedStyle(this.$refs.xlogo.$el).height, 10);
    if (winHeight > used) {
      this.featureStyle = `min-height:${winHeight - used}px;`;
    }
  }
};
</script>
