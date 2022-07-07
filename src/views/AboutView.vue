<template>
  <div class="home">
    <div>
      <!-- 请输入要查询的日期<input
        type="text"
        placeholder="格式为2022-6-20"
        v-model="userdate"
      /> -->
      <!-- <button @click="btnFn">查询</button> -->
      <button @click="$router.push('/')">分时</button>
    </div>
    <div
      class="main"
      ref="content"
      @touchstart="gtouchstart()"
      @touchmove="gtouchmove()"
      @touchend="showDeleteButton()"
    ></div>
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
      openCloseLowHight: [], // 开收低高
      vol: [], // 成交量
      pct: [], // 涨跌额
      amount: [], // 成交额
      pctChg: [], // 涨幅
      time: null, // 时间 日期
      // userdate: "", // 用户输入日期
      isShowTools: false,
      timeOutEvent: null,
      flag: true,
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
            code: "300990.SZ",
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
      if (data.data.item.length != 0) {
        // 已开盘 请求前一天数据
        // this.lastFn();
        // 存储数据
        this.data = data.data;
        // 处理数据
        this.dataFn();
        // 绘制图表
        this.getChart();
      } else {
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
        animation: false, //禁止动画效果 加强移动端滑动时流畅度
        // 提示框
        tooltip: {
          trigger: "axis",
          show: true,
          position: (point, params, dom, rect, size) => {
            // 固定在顶部
            return [point[0] - 180, "-5%"];
          },
          formatter: (param) => {
            if (param[0].data[1]) {
              return [
                "时间: " + param[0].name + '<hr size=1 style="margin: 3px 0">',
                "开盘价: " + param[0].data[1] + "<br/>",
                "最高价: " + param[0].data[4] + "<br/>",
                "最低价: " + param[0].data[3] + "<br/>",
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
                "最高价: " + param[1].data[4] + "<br/>",
                "最低价: " + param[1].data[3] + "<br/>",
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
          // position: function (pos, params, el, elRect, size) {
          //   const obj = {
          //     top: 10,
          //   };
          //   // 根据鼠标位置控制显示位置
          //   obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          //   return obj;
          // },
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
            // type: "category", 有data自动添加该属性
            data: this.time,
            gridIndex: 0,
            // boundaryGap: false, // 坐标轴两边留白
            axisLine: { onZero: false }, // 坐标轴轴线相关
            splitLine: { show: false }, // 分隔线
            axisTick: { show: false },
            axisLabel: {
              showMinLabel: true,
              showMaxLabel: true,
              hideOverlap: true,
              interval: 12, // 标签间隔
            },
            max: (value) => {
              if (this.data.item.length < 10) {
                return 10;
              } else {
                return value.max;
              }
            },
          },
          {
            // 涨幅坐标系x
            type: "category",
            data: this.time,
            gridIndex: 0,
            show: false,
            // boundaryGap: false, // 坐标轴两边留白
            axisPointer: {
              // show: false, // 坐标轴指示器
              label: {
                show: false,
              },
            },
            max: (value) => {
              if (this.data.item.length < 5) {
                return 5;
              } else {
                return value.max;
              }
            },
          },
          {
            // 成交量坐标系x
            type: "category",
            data: this.time,
            gridIndex: 1,
            // boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            axisPointer: {
              // 坐标轴指示器
              label: { show: false },
            },
            max: (value) => {
              if (this.data.item.length < 10) {
                return 10;
              } else {
                return value.max;
              }
            },
          },
          // 涨跌额坐标系x
          {
            type: "category",
            data: this.time,
            gridIndex: 0,
            show: false,
            // boundaryGap: false, // 坐标轴两边留白
            axisPointer: {
              // show: false, // 坐标轴指示器
              label: {
                show: false,
              },
            },
            max: (value) => {
              if (this.data.item.length < 5) {
                return 5;
              } else {
                return value.max;
              }
            },
          },
          // 成交额坐标系x
          {
            type: "category",
            data: this.time,
            gridIndex: 0,
            show: false,
            // boundaryGap: false, // 坐标轴两边留白
            axisPointer: {
              // show: false, // 坐标轴指示器
              label: {
                show: false,
              },
            },
            max: (value) => {
              if (this.data.item.length < 5) {
                return 5;
              } else {
                return value.max;
              }
            },
          },
        ],
        yAxis: [
          {
            // 日K坐标系y
            type: "value",
            scale: true,
            // splitNumber: 2,
            gridIndex: 0,
            max: (value) => {
              //   if (this.data.item.length < 5) {
              //     return (value.max * 1.2).toFixed(0);
              //   } else {
              //     return (value.max * 1.2).toFixed(0);
              //   }
              return (value.max * 1.2).toFixed(0);
            },
            // interval: 10,
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
            max: (value) => {
              if (this.data.item.length < 5) {
                return value.max * 5;
              } else {
                return value.max * 2;
              }
            },
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
          {
            type: "inside",
            xAxisIndex: [0, 1, 2, 3, 4, 5],
            moveOnMouseMove: true,
            start: this.data.item.length < 10 ? 0 : 30,
            end: this.data.item.length < 10 ? 100 : 60, // 根据数据多少判断视图范围
          },
          // {
          //   type: "slider",
          //   xAxisIndex: [0, 1, 2, 3, 4, 5],
          //   start: this.data.item.length < 10 ? 0 : 30,
          //   end: this.data.item.length < 10 ? 100 : 60,
          // },
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
            data: this.openCloseLowHight,
            type: "candlestick",
            xAxisIndex: 0,
            yAxisIndex: 0,
            markPoint: {
              data: [
                {
                  symbol: (value, params) => {
                    console.log(value, params);
                    const list = document.getElementsByTagName("text");

                    console.log();
                    console.log(
                      this.chart.getOption().xAxis[0].data[params.data.coord[0]]
                    );
                    if (params.data.coord[0] > 50) {
                      //  右下
                      return "path://M708.2666625976562,648.5333251953125l0,-196.26666259765625l85.33331298828125,0l0,341.33331298828125l-341.33331298828125,0l0,-85.33331298828125l196.26666259765625,0L256,315.73333740234375L315.73333740234375,256l392.5333251953125,392.5333251953125Z";
                    } else {
                      // 左下
                      return "path://M341.3333435058594,648.5333251953125l0,-196.26666259765625L256,452.26666259765625l0,341.33331298828125l341.33331298828125,0l0,-85.33331298828125L401.0666809082031,708.2666625976562l392.5332946777344,-392.5333251953125L733.8666381835938,256L341.3333435058594,648.5333251953125Z";
                    }
                  },
                  // symbol:
                  // 右上
                  // "path://M708.2666625976562,401.0666809082031L708.2666625976562,597.3333129882812l85.33331298828125,0L793.5999755859375,256l-341.33331298828125,0l0,85.33334350585938l196.26666259765625,0L256,733.8666381835938l59.73333740234375,59.73333740234375l392.5333251953125,-392.5332946777344Z",
                  //  右下
                  // "path://M708.2666625976562,648.5333251953125l0,-196.26666259765625l85.33331298828125,0l0,341.33331298828125l-341.33331298828125,0l0,-85.33331298828125l196.26666259765625,0L256,315.73333740234375L315.73333740234375,256l392.5333251953125,392.5333251953125Z",
                  // 左上
                  // "path://M341.3333435058594,401.0666809082031L341.3333435058594,597.3333129882812L256,597.3333129882812L256,256l341.33331298828125,0l0,85.33334350585938L401.0666809082031,341.3333435058594l392.5332946777344,392.5332946777344l-59.73333740234375,59.73333740234375L341.3333435058594,401.0666809082031Z",
                  // 左下
                  // "path://M341.3333435058594,648.5333251953125l0,-196.26666259765625L256,452.26666259765625l0,341.33331298828125l341.33331298828125,0l0,-85.33331298828125L401.0666809082031,708.2666625976562l392.5332946777344,-392.5333251953125L733.8666381835938,256L341.3333435058594,648.5333251953125Z",
                  symbolSize: 13,
                  symbolOffset: (value, params) => {
                    if (params.data.coord[0] > 50) {
                      return ["-70%", "-70%"];
                    } else {
                      return ["70%", "-70%"];
                    }
                  },
                  name: "max",
                  type: "max",
                  valueDim: "highest", // 所用的数据项  图表默认顺序为开收低高 默认名称为highest   后台数据为开收高低 操作数据时变更了push顺序   实际上高低会自动识别 图一致
                  // 标记相关
                  label: {
                    position: "top",
                    align: "left",
                    // verticalAlign: app.config.verticalAlign,
                    distance: 7,
                  },
                },
                {
                  name: "min",
                  type: "min",
                  valueDim: "lowest",
                  itemStyle: {
                    color: "green",
                  },
                  symbol: (value, params) => {
                    // console.log(value, params);
                    if (params.data.coord[0] > 50) {
                      //  右上
                      return "path://M708.2666625976562,401.0666809082031L708.2666625976562,597.3333129882812l85.33331298828125,0L793.5999755859375,256l-341.33331298828125,0l0,85.33334350585938l196.26666259765625,0L256,733.8666381835938l59.73333740234375,59.73333740234375l392.5333251953125,-392.5332946777344Z";
                    } else {
                      // 左上
                      return "path://M341.3333435058594,401.0666809082031L341.3333435058594,597.3333129882812L256,597.3333129882812L256,256l341.33331298828125,0l0,85.33334350585938L401.0666809082031,341.3333435058594l392.5332946777344,392.5332946777344l-59.73333740234375,59.73333740234375L341.3333435058594,401.0666809082031Z";
                    }
                  },
                  symbolSize: 13,
                  symbolOffset: (value, params) => {
                    if (params.data.coord[0] > 50) {
                      return ["-70%", "70%"];
                    } else {
                      return ["70%", "70%"];
                    }
                  },
                  label: {
                    position: "bottom",
                    align: "right",
                    // verticalAlign: app.config.verticalAlign,
                    distance: 1,
                  },
                },
              ],
            },
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
      // 成交量 => 变为手 100股为1手
      let volList = [];
      this.data.item.forEach((item, index) => {
        volList.push(item[4] / 100);
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
      // 开收低高 日k
      let openCloseLowHightList = [];
      this.data.item.forEach((item) => {
        openCloseLowHightList.push(item[0]);
        openCloseLowHightList.push(item[1]);
        openCloseLowHightList.push(item[3]);
        openCloseLowHightList.push(item[2]);
        this.openCloseLowHight.push(openCloseLowHightList);
        openCloseLowHightList = [];
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
    //长按事件（起始）
    gtouchstart() {
      var that = this;
      this.timeOutEvent = setTimeout(() => {
        that.longPress();
      }, 800); //这里设置定时器，定义长按  毫秒触发长按事件
      return false;
    },
    //手释放，则取消长按事件，此时可以执行onclick应该执行的事件
    showDeleteButton(e) {
      clearTimeout(this.timeOutEvent); //清除定时器
      if (this.timeOutEvent != 0) {
        //这里写要执行的内容（如onclick事件）
        console.log(e, "点击但未长按");
        this.chart.setOption({
          tooltip: {
            show: false,
          },
          dataZoom: {
            moveOnMouseMove: true,
          },
        });
      }
      return false;
    },
    //如果手指有移动，则取消所有事件，此时说明只是要移动而不是长按
    gtouchmove() {
      clearTimeout(this.timeOutEvent); //清除定时器
      this.timeOutEvent = 0;
      // if (this.timeOutEvent != 0) {
      //这里写要执行的内容（如onclick事件）
      // alert("移动");
      console.log("移动");
      this.chart.setOption({
        tooltip: {
          show: false,
        },
        dataZoom: {
          moveOnMouseMove: true,
        },
      });
      // }
      // return false;
    },
    //真正长按后应该执行的内容
    longPress(val) {
      this.timeOutEvent = 0;
      //执行长按要执行的内容
      console.log("长按");
      // 合并图表设置
      this.chart.setOption({
        tooltip: {
          show: true,
        },
        dataZoom: {
          moveOnMouseMove: false,
        },
      });
    },
    // 自动获取屏幕坐标
    autoGetOffset() {
      this.chart.getDom();
    },
    // 当最高价靠右时调用  更新图标设置
    // hightRight() {
    //   if (this.flag) {
    //     console.log(11);
    //     this.chart.setOption({
    //       series: [
    //         {
    //           name: "日K",
    //           markPoint: {
    //             data: {
    //               name: "max",
    //               symbolOffset: ["-70%", "-70%"],
    //               label: {
    //                 align: "right",
    //               },
    //             },
    //           },
    //         },
    //       ],
    //     });
    //     this.flag = false;
    //   }
    // },
  },
};
</script>

<style>
.main {
  width: 800px;
  height: 500px;
  margin: auto;
  /* background-color: aqua; */
  /* touch-action: none; */
}
</style>
