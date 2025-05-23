const fs=require('fs');
const xlsx = require('xlsx');
const path=require('path');

let filename='./test1.txt'//待分析语法文件路径
grammerParse(filename)
/*
filename='./test2.txt'
grammerParse(filename)
filename='./test3.txt'
grammerParse(filename)
*/

function grammerParse(filename){
    let succ=null;
//划分token
let name=path.basename(filename).replace(path.extname(filename),'')
let buf=fs.readFileSync(filename,'utf8')
let token=buf.toString().replace(/(\s)/g,'~').split('~').filter(ite=>ite!='')

//读取SLR(1)分析表
const workbook = xlsx.readFile('./SLR(1).xlsx');
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
    console.log('产生式序列如下')
    sequences.forEach(ele=>{
        console.log(ele)
    })
    console.log('语法分析成功')
    console.log('产生式序列已保存至'+name+'-sequence.txt文件中')
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
    }
    else if(result==undefined){
       
        fs.unlinkSync(name+'-sequence.txt');
        succ='fail'
        console.error('语法有误，请仔细检查')
        break;
    }
 console.log(stack.map(ele=>ele.fu).join(''),'    ',leave.join(''))
}
return succ;
}