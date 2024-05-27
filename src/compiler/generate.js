// 编写 <div id="app" class='demo' >hello {{name}} <span>world</span></div>
// 期待结果 render (){
// _c节点 _v文本 _s jsonstringfy
//  return _c("div",{id:'app',class='demo'},_v('hello'+_s(name)),_c('span',null,_v('hello')))
// }
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function genProps(attrs){

    let str=''
    for(let i=0;i<attrs.length;i++){
        let attr=attrs[i];
        // 样式单独处理 fixme
        if(attr.name=='style'){
            let obj={}
            attr.value.split(";").forEach(item=>{ // 样式分割
                let [key,value]=item.split(":") //样式值和value分割
                obj[key]=value
            })
            attr.value=obj
        }
        // 简单属性 直接写进去
        str+=`${attr.name}:${JSON.stringify(attr.value)},` ////JSON.stringify加引号效果
    }
    return `{attrs:{${str.slice(0,-1)}}}` // 属性要加上{},去掉最后一个逗号
}

function  gen(node){
    if(node.type==1){// 生成元素节点
        return `${generate(node)}`
    }else {
        // 如果是文本
        let text=node.text //文本
        // 如果是普通文本 不带{{}}
        if(!defaultTagRE.test(text)){
            return `_v(${JSON.stringify(text)})` //JSON.stringify加引号效果 _v('hello {{name}}')
        }
        // 如果带{{}}  =>_v('hello'+_s(name)')
        let tokens=[] // 存放每一段代码
        let lastIndex=defaultTagRE.lastIndex=0// 如果正则为全局模式 需要每次使用前置为0
        let match,index; //每次匹配的结果
        // 匹配
        while (match=defaultTagRE.exec(text)){
            index=match.index; //保存匹配到的索引
            if(index>lastIndex){
                tokens.push(JSON.stringify(text.slice(lastIndex,index)))
            }
            tokens.push(`_s(${match[1].trim()})`)
            lastIndex=index+match[0].length
        }
        if(lastIndex<text.length){
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join('+')})`

    }

}
function genChildren(el){
    const children=el.children;
    if (children){ //将所有转化后的儿子用逗号拼接起来
       return  `[${children.map(child=>gen(child)).join(",")}]`
    }
}
// 拼代码
export default function generate(el){ //

 let children=genChildren(el)  //生成儿子
 let code=`_c('${el.tag}',${// tag名称转换
     el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'   // 属性转换
 }${ 
     children?`,${children}`:''
 })`

 return code


}