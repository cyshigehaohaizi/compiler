import {compileToFunctions} from "./compiler";
//  这里 默认先去找 render 函数 ,
//  如果没有render方法就去找template,
//  如果没template就找el指定的id找到元素进行渲染
//  这里就用template =>ast语法树
// let vm =new Vue({
//     el:'#app',
//     data(){
//         return {
//             arr:[{a:1}]
//         }
//     },
//     render(h){
//         return h('div',{
//             id:'a',
//         },'hello')
//     }
// })

let a = 'hahah'
let name='张三'
let template = `<div id="a" class='b' >hello {{name}}<span>world</span></div>`
let template2 =`<div id="app" style="color:red">hello {{name}} <span>world</span></div>`
// 编译原理template=>render
const render = compileToFunctions(template2)
