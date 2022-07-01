export default class MyWebSocket extends WebSocket {
    constructor(url, protocols) {
        super(url, protocols);
        return this
    }

    /*
     * 入口函数
     * @param heartBeatConfig 心跳设置
     * @param isReconnect 是否断线重连
     */
    init(heartBeatConfig, isReconnect) {
        // 连接完成
        this.onopen = this.openHandler;
        // 连接断开
        this.onclose = this.closeHandler;
        // 接收消息
        this.onmessage = this.messageHandler;
        // 连接出错
        this.onerror = this.errorHandler;
        // 心跳设置
        // time：心跳时间间隔 timeout：心跳超时间隔 reconnect：断线重连时间间隔
        this.heartBeat = heartBeatConfig;
        // 是否重连
        this.isReconnect = isReconnect;
        // 断线重连定时器
        this.reconnectTimer = null;
        // socket连接状态
        this.webSocketState = false;
    }
    sendMsg(obj) {
        // 发送消息
        if (this.webSocketState) {
            this.send(JSON.stringify(obj));
        }
    }
    messageHandler(res) {
        // 接收消息
        if (res.data === "pong") {
            // 乒乓机制
            console.info(res.data);
        } else {
            let result = JSON.parse(res.data);
            if (result.group) {
                let eventFuncName = result.group;
                if (["stock_k_line", "time_minutes_chart"].includes(result.group)) {
                    if (result.data.code) {
                        eventFuncName = 'latest_' + result.group + "_" + result.data.code;
                    }
                }
                eventBus.emitEvent(eventFuncName, result);
            }
        }
        this.webSocketState = true;
    }

    openHandler() {
        // eventBus.emitEvent('xxxx',xxxx) //触发一些事件
        //socket状态设置为连接，做为后面的断线重连的拦截器
        this.webSocketState = true;
        //是否启动心跳机制
        this.heartBeat && this.heartBeat.time ? this.startHeartBeat(this.heartBeat.time) : "";
        console.info("websocket连接成功");
    }

    closeHandler() {
        // eventBus.emitEvent('xxxx',xxxx) //触发一些事件
        //socket状态设置为断线
        this.webSocketState = false;
        console.warn("websocket连接断线");
    }

    errorHandler() { //socket出错
        this.webSocketState = false //socket状态设置为断线
            // eventBus.emitEvent('websocket_connect_error')
            // this.reconnectWebSocket() //重连
    }

    startHeartBeat(time = 10000) {
        // 发送心跳
        setTimeout(() => {
            // 乒乓机制
            this.send('ping');
            this.waitingServer();
        }, time);
    }

    waitingServer() {
        // 通过心跳间隔延时等待服务端响应
        // 通过webSocketState判断是否连线成功
        this.webSocketState = false;
        setTimeout(() => {
            if (this.webSocketState) {
                // 处于连接状态则继续发送心跳
                this.startHeartBeat(this.heartBeat.time);
                return;
            }
            console.info('连接已断开');
            try {
                this.close();
                console.info('连接关闭');
            } catch (e) {
                console.info('连接已关闭');
            }
            // 启动重连机制
            this.reconnectWebSocket();
        }, this.heartBeat.timeout);

    }

    reconnectWebSocket() {
        // 重新连接

        // 是否允许重连
        if (!this.isReconnect) {
            return;
        }
        this.reconnectTimer = setTimeout(() => {
            console.info("连接断开，正在尝试重新建立连接...");
            eventBus.emitEvent('websocket_connect_error', null) //触发监听的重连事件
        }, this.heartBeat.reconnect);

    }
}