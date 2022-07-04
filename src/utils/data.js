// 计算最大值
export function calMax(arr) {
    let max = Math.max(...arr);
    // let maxint = Math.ceil(max / 9.5); // 不让最高的值超过最上面的刻度
    let maxval = (max * 1.3).toFixed(2); // 让显示的刻度是整数

    // 为了防止数据为0时，Y轴不显示，给个最大值
    // if (maxval == 0) { maxval = 1 }
    return maxval;
}

//计算最小值
export function calMin(arr) {
    let min = Math.min(...arr);
    // let minint = Math.floor(min / 10);
    let minval = (min * 1.3).toFixed(2); //让显示的刻度是整数
    return minval;
}