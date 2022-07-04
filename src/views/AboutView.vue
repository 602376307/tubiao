<template>
  <div class="home">
    首页
    <div>
      <!-- 请输入要查询的日期<input
        type="text"
        placeholder="格式为2022-6-20"
        v-model="userdate"
      /> -->
      <button @click="btnFn">查询</button>
      <button @click="$router.push('/')">分时</button>
    </div>
    <div class="main" ref="content"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { calMax, calMin } from "@/utils/data";
export default {
  name: "HomeView",
  components: {},
  data() {
    return {
      chart: null,
      mySocket: null,
      data: null, // 返回的数据
      open: [], // 开盘价
      close: [], // 收盘价
      hight: [], // 最高价
      low: [], // 最低价
      openCloseHightLow: [], // 开收高低
      vol: [], // 成交量
      pct: [], // 涨跌额
      amount: [], // 成交额
      pctChg: [], // 涨幅
      time: null, // 时间 日期
      // userdate: "", // 用户输入日期
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
      // 连接成功
      console.log("open");
      // 请求数据
      this.mySocket.send(
        JSON.stringify({
          event: "stock_detail",
          group: "stock_k_line",
          version: "appv.controller.applet",
          data: {
            code: "000002.SZ",
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
      console.log("message", data.data.item);
      // 判断是否开盘
      if (data.data.item.length !== 0) {
        // 已开盘 请求前一天数据
        // this.lastFn();
        // 存储数据
        this.data = data.data;
        // 处理数据
        this.dataFn();
        // 绘制图表
        this.getChart();
      } else {
        alert("当日未开盘，请换一天吧");
      }
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
          // formatter: "{b0}<br/>{a1}: {c1}%<br />{a2}: {c2}", // 内容格式器
          formatter: (param) => {
            if (param[0].data[1]) {
              return [
                "时间: " + param[0].name + '<hr size=1 style="margin: 3px 0">',
                "开盘价: " + param[0].data[1] + "<br/>",
                "最高价: " + param[0].data[3] + "<br/>",
                "最低价: " + param[0].data[4] + "<br/>",
                "收盘价: " + param[0].data[2] + "<br/>",
                "涨跌额: " + param[2].data + "<br/>",
                "涨跌幅: " + param[1].data + "<br/>",
                "成交量: " + param[4].data + "<br/>",
                "成交额: " + param[3].data + "<br/>",
              ].join("");
            } else {
              return [
                "时间: " + param[0].name + '<hr size=1 style="margin: 3px 0">',
                "开盘价: " + param[1].data[1] + "<br/>",
                "最高价: " + param[1].data[3] + "<br/>",
                "最低价: " + param[1].data[4] + "<br/>",
                "收盘价: " + param[1].data[2] + "<br/>",
                "涨跌额: " + param[3].data + "<br/>",
                "涨跌幅: " + param[2].data + "<br/>",
                "成交量: " + param[0].data + "<br/>",
                "成交额: " + param[4].data + "<br/>",
              ].join("");
            }
          },
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
            height: "20%",
          },
        ],
        xAxis: [
          {
            // 日K坐标系
            // type: "category",
            data: this.time,
            gridIndex: 0,
            boundaryGap: false, // 坐标轴两边留白
            axisLine: { onZero: false }, // 坐标轴轴线相关
            splitLine: { show: false }, // 分隔线
            axisTick: { show: false },
            axisLabel: {
              showMinLabel: true,
              showMaxLabel: true,
              hideOverlap: true,
              interval: 12, // 标签间隔
            },
            // formatter: {
            //   minute: "{HH}:{mm}",
            // },
          },
          {
            // 涨幅坐标系x
            type: "category",
            data: this.time,
            gridIndex: 0,
            show: false,
            boundaryGap: false, // 坐标轴两边留白
            axisPointer: {
              // show: false, // 坐标轴指示器
              label: {
                show: false,
              },
            },
          },
          {
            // 成交量坐标系x
            type: "category",
            data: this.time,
            gridIndex: 1,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            axisPointer: {
              // 坐标轴指示器
              label: { show: false },
            },
          },
          // 涨跌额坐标系x
          {
            type: "category",
            data: this.time,
            gridIndex: 0,
            show: false,
            boundaryGap: false, // 坐标轴两边留白
            axisPointer: {
              // show: false, // 坐标轴指示器
              label: {
                show: false,
              },
            },
          },
          // 成交额坐标系x
          {
            type: "category",
            data: this.time,
            gridIndex: 0,
            show: false,
            boundaryGap: false, // 坐标轴两边留白
            axisPointer: {
              // show: false, // 坐标轴指示器
              label: {
                show: false,
              },
            },
          },
        ],
        yAxis: [
          {
            // 日K坐标系y
            type: "value",
            scale: true,
            // splitNumber: 1,
            gridIndex: 0,
          },
          {
            // 涨幅坐标系y
            type: "value",
            scale: true,
            splitNumber: 1,
            show: false,
            gridIndex: 0,
            axisPointer: {
              show: false,
            },
          },
          {
            // 成交量坐标系y
            scale: true,
            splitNumber: 2,
            // axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            gridIndex: 1,
          },
          // 涨跌额坐标系y
          {
            type: "value",
            scale: true,
            splitNumber: 1,
            show: false,
            gridIndex: 0,
            axisPointer: {
              show: false,
            },
          },
          // 成交额坐标系y
          {
            type: "value",
            scale: true,
            splitNumber: 1,
            show: false,
            gridIndex: 0,
            axisPointer: {
              show: false,
            },
          },
        ],
        // 缩放区域
        dataZoom: [
          { type: "inside", xAxisIndex: [0, 1, 2, 3, 4, 5] },
          { type: "slider", xAxisIndex: [0, 1, 2, 3, 4, 5] },
        ],
        axisPointer: {
          link: {
            // 联动
            xAxisIndex: [0, 1, 2, 3, 4, 5],
          },
        },
        series: [
          // 成交价格
          {
            name: "日K",
            data: this.openCloseHightLow,
            type: "candlestick",
            xAxisIndex: 0,
            yAxisIndex: 0,
          },
          // 涨幅
          {
            name: "涨幅",
            data: this.pctChg,
            type: "line",
            symbol: "none", // 控制图上小圆点
            xAxisIndex: 1,
            yAxisIndex: 1,
            lineStyle: {
              opacity: 0,
            }, // 线条样式
          },
          // 成交量
          {
            name: "成交量",
            type: "bar",
            xAxisIndex: 2, // 控制出现在第个坐标系
            yAxisIndex: 2,
            data: this.vol,
            // 颜色
            itemStyle: {
              normal: {
                // 以函数形式设置 dataIndex 当前数据下标
                color: (params) => {
                  // 第一个先默认为红
                  if (params.dataIndex === 0) {
                    return "red";
                  } else {
                    if (
                      this.pctChg[params.dataIndex] >=
                      this.pctChg[params.dataIndex - 1]
                    ) {
                      return "red";
                    } else {
                      return "green";
                    }
                  }
                },
              },
            },
          },
          // 涨跌额
          {
            name: "涨跌额",
            data: this.pct,
            type: "line",
            symbol: "none", // 控制图上小圆点
            xAxisIndex: 1,
            yAxisIndex: 1,
            lineStyle: {
              opacity: 0,
            }, // 线条样式
          },
          // 成交额
          {
            name: "成交额",
            data: this.amount,
            type: "line",
            symbol: "none", // 控制图上小圆点
            xAxisIndex: 1,
            yAxisIndex: 1,
            lineStyle: {
              opacity: 0,
            }, // 线条样式
          },
        ],
      });
    },
    // 操作数据方法
    dataFn(lastClose, lastVol, lastPctChg) {
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
        timeList.push(item[11]);
      });
      this.time = timeList;
      // 涨幅
      let pctChgList = []; // 将小数化为百分数
      this.data.item.forEach((item, index) => {
        pctChgList.push(item[9]);
        // pctChgList.push((item[5] * 100).toFixed(2) + "%");
      });
      // console.log(pctChgList);
      this.pctChg = pctChgList;
      // 开收高低 日k
      let openCloseHightLowList = [];
      this.data.item.forEach((item) => {
        openCloseHightLowList.push(item[0]);
        openCloseHightLowList.push(item[1]);
        openCloseHightLowList.push(item[2]);
        openCloseHightLowList.push(item[3]);
        this.openCloseHightLow.push(openCloseHightLowList);
        openCloseHightLowList = [];
      });
      // 涨跌额
      let pctList = [];
      this.data.item.forEach((item, index) => {
        pctList.push(item[8]);
      });
      this.pct = pctList;
      // 成交额
      let amountList = [];
      this.data.item.forEach((item, index) => {
        amountList.push(item[5]);
      });
      this.amount = amountList;
    },
    //
    btnFn() {},
    // 请求前一天数据
    lastFn() {
      const that = this;
      const socket = new WebSocket("wss://stocktest.yj81.com/server/stock");
      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            event: "stock_detail",
            group: "stock_time_sharing_diagram",
            version: "appv.controller.v1",
            data: { code: "000001.SZ", date: "2022-6-20" },
          })
        );
      };
      socket.onerror = () => {};
      socket.onmessage = (e) => {
        // 收到前一天数据
        const data = JSON.parse(e.data);
        // console.log("message", data.data.item);
        const lastClose = data.data.item[239][0]; // 前一天15：30收盘价
        const lastVol = data.data.item[239][6]; // 前一天15：30成交量
        const lastPctChg = data.data.item[239][5]; // 前一天15：30涨幅
        // console.log(lastVol);
        // 处理今天数据
        that.dataFn(lastClose, lastVol, lastPctChg);
        // 绘制表格
        that.getChart();
      };
      socket.onclose = () => {};
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

