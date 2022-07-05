import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// Vue.directive('longtouch', function(el, binding) {
//     let oDiv = el
//     let x = 0
//     let y = 0
//     let z = 0
//     let timer = null
//     oDiv.addEventListener('touchstart', function(e) {
//         if (e.touches.length > 1) {
//             return false
//         }
//         z = 0
//         timer = setTimeout(function() {
//             z = 1
//         }, 500)
//         x = e.touches[0].clientX
//         y = e.touches[0].clientY
//         e.preventDefault()
//     }, false)
//     document.addEventListener('touchmove', function(e) {
//         if (x !== e.touches[0].clientX || y !== e.touches[0].clientY) {
//             clearTimeout(timer)
//             return false
//         }
//     }, false)
//     document.addEventListener('touchend', function(ev) {
//         if (z !== 1) {
//             clearTimeout(timer)
//             x = 0
//             y = 0
//             return false
//         } else {
//             x = 0
//             y = 0
//             z = 0
//             console.log('长安结束'); // 长按alert vue ios长按图表空白
//         }
//     }, false)
// })

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')