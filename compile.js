const fs=require('fs');
const xlsx = require('xlsx');
const path=require('path');
module.exports=(filename)=>{
    let succ=null;
//生成token文件
let name=path.basename(filename).replace(path.extname(filename),'')
let buf=fs.readFileSync(filename,'utf8')
let token=buf.toString().replace(/(\s)/g,'~').split('~').filter(ite=>ite!='')
fs.writeFileSync(name+'-token.txt', '', 'utf8');
token.forEach((ele,ind)=>{
    try{
        fs.appendFileSync(name+'-token.txt', `${ind},${ele}\n`, 'utf8');
    }catch(err){
        console.err(err)
    }
})
//读取SLR分析表
const workbook = xlsx.readFile('./SLR.xlsx');
const sheetName = workbook.SheetNames[0]; // 假设只有一个工作表
const sheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
let slr = jsonData.map(row => row.map(cell => cell));
slr.forEach(ele=>{
    let arr=ele;
    arr.shift();
    ele=arr;
})
let arr=slr;
let columns=arr[0]
arr.shift();
slr=arr;

//语法分析
let stack=[];
let leave=token;
let sequences=[];
let product=[[],['SL’','->','SL'],['SL','->','S','SL'],['SL','->','S'],['S','->','E',';'],
['S','->','IfSt'],['S','->','WhileSt'],['S','->','BreakSt'],['S','->','ContinueSt'],
['S','->','ReturnSt'],['E','->','AE'],['E','->','RE'],['E','->','LE'],['AE','->','AE','OP','AE'],
['AE','->','(','AE',')'],['AE','->','id'],['AE','->','num'],['RE','->','AE','=','=','AE'],
['RE','->','AE','!','=','AE'],['RE','->','AE','<','AE'],['RE','->','AE','>','AE'],['RE','->','AE','>','=','AE'],
['RE','->','AE','<','=','AE'],['LE','->','LE','&','&','LE'],['LE','->','LE','|','|','LE'],
['LE','->','!','LE'],['LE','->','RE'],['IfSt','->','if','(','E',')','{','SL','}'],['IfSt','->','if','(','E',')','{','SL','}','else','{','SL','}'],
['WhileSt','->','while','(','E',')','{','SL','}'],['BreakSt','->','break',';'],['ReturnSt','->','return','E',';'],
['ContinueSt','->','continue',';'],['OP','->','+'],['OP','->','-'],['OP','->','*'],['OP','->','/']]
leave.push('$')
stack.push({stas:0,fu:'$'})
fs.writeFileSync(name+'-sequence.txt', '', 'utf8');
while(1){
    let fu=leave[0];
    leave.shift();
    let column=columns.indexOf(fu)
    let row=stack[stack.length-1].stas
    let result=slr[row][column]
    let reg=/^r\d*$/
    if(result=='ACC'){
        succ="success";
        sequences.push(product[1].join(''))
        try{
        fs.appendFileSync(name+'-sequence.txt', product[1].join('')+'\n', 'utf8');
    }catch(err){
        console.err(err)
    }
    sequences.forEach(ele=>{
        console.log(ele)
    })
    console.log('语法分析成功')
        break;
    }
    else if(Number.isInteger(result)){
        stack.push({stas:result,fu:fu})
    }
    else if(reg.test(result)){
        let rr=parseInt(result.slice(1,result.length))

        for(let i=0;i<product[rr].length-2;i++){
            stack.pop();
        }
        leave.unshift(fu)
        sequences.push(product[rr].join(''))
        try{
        fs.appendFileSync(name+'-sequence.txt', product[rr].join('')+'\n', 'utf8');
    }catch(err){
        console.err(err)
    }
      leave.unshift(product[rr][0])

    //   if(rr==3)    console.log(1,stack)
    }
    else if(result==undefined){
        // console.log(2,stack)
        succ='fail'
        console.error('语法有误，请仔细检查')
        break;
    }
 console.log(stack.map(ele=>ele.fu).join(''),'    ',leave.join(''))
}
return succ;
}