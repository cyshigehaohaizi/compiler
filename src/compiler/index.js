import parseHTML from "./parse";
import generate from "./generate";

export function compileToFunctions(template) {
    console.warn('template-----',template)
    // html模板=>render函数
    // 1. html代码转换成 ast语法树(可以用ast树描述语言本身(就是代码))
    // ast(描述语言本身,还可以描述js,css等) 和 虚拟dom(用对象描述节点,他可以加自己的一些属性啥的,只能描述dom)区别
    let ast = parseHTML(template)
    console.warn('ast--------',ast)
    // 2. 优化这棵树
    // todo
    // 3. 通过ast 重新生成代码
    let code = generate(ast)
    console.warn('render字符串-----',code)
    // 4. 将code转换为函数(但是里面的_v,_s啥的所以用with)
    // let render=new Function(code)
    // with语法  with语句用于临时拓展作用域链
    // 将obj添加到作用域链的头部，然后执行函数体内部代码，最后把作用域链恢复到原始状态。
    // 在严格模式下是禁止使用with语句的.
    // let obj={a:1,b:2}
    // with(obj){
    //     console.log(a,b) // 1,2
    // }
    // 通过with来进行取值,调用render函数的就可以改变this
    //let render=new Function(`with(this){return ${code}`)



}