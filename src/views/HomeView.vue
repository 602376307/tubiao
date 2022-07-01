<template>
  <div class="home">
    首页
    <div class="main" ref="content"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "HomeView",
  components: {},
  data() {
    return {
      chart: null,
      mySocket: null,
      data: null, // 返回的数据
      vol: [], // 成交量
      close: [], // 收盘价
      time: null, // 时间
    };
  },
  created() {
    this.init();
  },
  mounted() {},
  destroyed() {
    // 关闭连接
    // this.mySocketClose();
  },
  methods: {
    // 初始化连接
    init() {
      this.mySocket = new WebSocket("wss://stocktest.yj81.com/server/stock");
      this.mySocket.onopen = this.socketOpen;
      this.mySocket.onerror = this.socketError;
      this.mySocket.onmessage = this.socketMessage;
      this.mySocket.onclose = this.socketClose;
    },
    socketOpen(e) {
      console.log("open");
      // 请求数据
      this.mySocket.send(
        JSON.stringify({
          event: "stock_detail",
          group: "stock_k_line",
          version: "appv.controller.applet",
          data: {
            code: "000001.SZ",
            category: "day",
            size: "100",
            page: "1",
            token: "",
            fuquan: "q",
          },
        })
      );
    },
    socketError() {
      console.log("error");
    },
    socketMessage(e) {
      // 收到数据
      const data = JSON.parse(e.data);
      console.log("message", data.data);
      // 存储数据
      this.data = data.data;
      // 处理数据
      this.dataFn();
      // 绘制表格
      this.getChart();
    },
    socketClose() {
      console.log("close");
    },
    // 图表
    getChart() {
      // 初始化图表
      this.chart = echarts.init(this.$refs.content);
      // 图表内容设置
      this.chart.setOption({
        // 提示框
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          textStyle: {
            color: "#000",
          },
          position: function (pos, params, el, elRect, size) {
            const obj = {
              top: 10,
            };
            // 根据鼠标位置控制显示位置
            obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
            return obj;
          },
        },
        // 网格
        grid: [
          {
            left: "10%",
            right: "8%",
            height: "50%",
          },
          {
            left: "10%",
            right: "8%",
            top: "63%",
            height: "16%",
          },
        ],
        xAxis: [
          {
            type: "category",
            data: [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
              36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
              52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67,
              68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
              84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
              100,
            ],
            boundaryGap: false, // 坐标轴两边留白策略
            axisLine: { onZero: false }, // 坐标轴轴线相关
            splitLine: { show: false }, // 分隔线
          },
          {
            // 第二个坐标系x
            type: "category",
            data: [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
              36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
              52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67,
              68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
              84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
              100,
            ],
            gridIndex: 1,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
          },
        ],
        yAxis: [
          {
            type: "value",
            // scale: true,
          },
          {
            // 第二个坐标系y
            // scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: "成交价格",
            data: this.close,
            type: "line",
          },
          {
            name: "成交量",
            type: "bar",
            xAxisIndex: 1, // 控制出现在第2个坐标系
            yAxisIndex: 1,
            data: this.vol,
          },
        ],
      });
    },
    // 操作数据方法
    dataFn() {
      // 筛选需要的数据
      // 成交量
      let volList = [];
      this.data.item.forEach((item, index) => {
        volList.push(item[4]);
      });
      this.vol = volList;
      // 收盘价
      let closeList = [];
      this.data.item.forEach((item, index) => {
        closeList.push(item[1]);
      });
      this.close = closeList;
      // 时间
      let timeList = [];
      this.data.item.forEach((item, index) => {
        closeList.push(item[11]);
      });
      this.time = timeList;
    },
  },
};
</script>

<style>
.main {
  width: 1000px;
  height: 700px;
  margin: auto;
  /* background-color: aqua; */
}
</style>
