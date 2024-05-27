/* <div id="app" class='demo'> hello {{name}} <span>world</span></div>
 ast={
     tag:'div',// 标签名称
     type:1, //类型 节点1文本3
     parent:null,// 父节点
     attrs:[]
     children:[{
     tag:null,
     parent:父div,
     attrs:[],
     text:hello{{name}}
     },{
     tag:'span',parent:父div
     }]
 }

 */

// 匹配标签名 my-xx
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
// 匹配这样的 my:xx 标签名称<my:xx></my:xx>
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 匹配属性 a="xxx" | a='xxx' | a=xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 匹配动态属性@
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 匹配标签开头的 <my
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 匹配 标签结束的  > 或者 />
const startTagClose = /^\s*(\/?)>/
// 匹配标签结束的 </my>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
// 匹配 {{ xx }}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
const doctype = /^<!DOCTYPE [^>]+>/i
const comment = /^<!\--/
const conditionalComment = /^<!\[/


// <div id="app" class='demo'> hello {{name}} <span>world</span></div>
// 解析完一部分就删除一部分
// 比如说解析完<div id="a"> 直接就删除 如此循环 直到字符串为空为止
export default function parseHTML(html) {

    function createASTElement(tagName, attrs) {
        return {
            tag: tagName,// 标签名称
            type: 1,// 类型
            children: [], // 孩子列表
            attrs,// 属性
            parent: null //父元素
        }
    }

    let root;
    let currentParent;
    let stack = [] // 标签校验 用栈来校验 <div> <span> </span> </div> [div,span,]

    // 生成开始标签
    function start(tagName, attrs) {
        console.log('开始标签----:', tagName, attrs)
        let element = createASTElement(tagName, attrs)
        if (!root) {
            root = element
        }
        currentParent = element // 当前解析的标签 保存起来
        stack.push(element) // 遇到开始元素就入栈
    }

    // 生成结束标签
    function end(tagName) {
        console.log('结束标签----:', tagName)
        // 1. 遇到结束元素就出栈
        // 2. 设置当前处理元素为上一个元素
        // 3. 并且设置出栈的元素的parent为上一个元素,并且设置父元素的子元素(这里就确认了父子关系)
        let element = stack.pop()  // 出栈(取出最后一个元素)
        // <div> <p></p>hello </div>  [div,p] 当遇到p结束标签时就取出p,然后把当前的标签置为div
        // 这里就是 取出栈中的倒数第二个作为
        currentParent = stack[stack.length - 1]
        if (currentParent) { //在闭合时判出他的父元素
            element.parent = currentParent
            currentParent.children.push(element)
        }
    }

    // 生成文本
    function chars(text) {
        console.log('文本-----:', text)
        text = text.replace(/\s/g, "")
        if (text) { // 解析的文本添加到当前的标签中
            currentParent.children.push({
                type: 3,
                text
            })
        }
    }


    while (html) {// 只要html不为空字符串一直解析
        let textEnd = html.indexOf('<')
        if (textEnd == 0) {// 如果textEnd是0表示当前一定是个标签
            const startTagMatch = parseStartTag() //开始标签匹配结果 处理开始标签
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue; // 开始标签匹配完继续进行下一轮匹配
            }
            const endTagMatch = html.match(endTag)   // 结束标签匹配结果 处理结束标签
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])// 将结束标签传入
                continue;
            }
        }
        // 如果<是大于0的 那么是文本标签
        // 处理文本
        let text;
        if (textEnd > 0) {
            text = html.substring(0, textEnd)
        }
        if (text) {
            // 处理完文本那么继续删除
            advance(text.length)
            chars(text)
        }
    }

    // 将字符串截取操作,然后更新html内容
    function advance(n) {
        html = html.substring(n)
    }

    function parseStartTag() {
        const start = html.match(startTagOpen) // ["<div","div"],第一项匹配到的字符串,第二项标签名称
        if (start) {
            // 如果匹配到开始标签 那么 1. 处理标签属性为ast格式 2. 删除匹配好的内容
            const match = {
                tagName: start[1],
                attrs: []
            }
            // 匹配成功的内容删除掉
            advance(start[0].length)
            // console.log(html);//  id="a"> hello {{name}} <span>world</span></div>
            // 然后循环匹配标签属性,如果遇到闭合标签 > />那么结束
            let end;
            let attr;
            // 如果不是闭合标签并且有属性匹配,那么一直循环匹配
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                // console.log(JSON.stringify(attr))  // [" id=\"a\"","id","=","a",null,null]
                // 0 匹配字符串 , 1属性key , 2 = , 3 双引号结果 , 4 单引号结果,5 没有引号的结果
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
                // 匹配成功的内容删除掉
                advance(attr[0].length)
            }

            // 如果遇到闭合标签,继续删除当前的闭合标签 ,并且返回 match
            if (end) {
                advance(end[0].length)
                return match
            }
        }
        return false
    }
    return root
}
