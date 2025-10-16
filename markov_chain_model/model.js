import {T,T_2,T_OPINION_PATCH} from "./data.js";

const list_data =[T,T_OPINION_PATCH]

class logs{
    static isResultOnly = true;
    static isErrorOnly = false;
    static start()          {if(this.isResultOnly || this.isErrorOnly){return};console.log("%c開始","background-color: coral;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1.5em;")}
    static end(i)            {console.log(`%c処理終了(${i})`,"background-color: steelblue;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1em;")}
    static process(Now,Next){if(this.isResultOnly || this.isErrorOnly){return};if(!(Now && Next)){this.error("{Now} or {Next} to Null")}else{console.log(`%c途中経過%c:%c${Now}%c → %c${Next}`,"background-color:green;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1.1em;","font-size: 1.5em","background-color: royalblue;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1.1em;","","background-color: dimgray;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1.1em;")}}
    static result(data)     {if(!data){this.error("{data} to Null")}else{console.log(`%c結果%c:%c${data}`,"background-color: coral;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1.5em;","font-size: 1.5em","background-color: royalblue;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1.5em;")}}
    static error(e)         {const el = (ea)=>{console.log(`%c警告%c:%c${ea}`,"background-color: brown;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1.4em;","","background-color: dimgray;border-radius: 0.2em;padding: 0.2em 1em;color: aliceblue;font-size: 1.3em;")};if(!e){el("{e} to Null")}else{el(e)};}
    Info(){}
}

class Markov{
    constructor(T,T_2){
        this.data = this.ex(T);
        this.data_2 = T_2;
        this.isFlag = false;
        this.b = 1;
    }
    ex(dif){
        const out = {};
        dif.map((e)=>{
                for (const [multiKey, transitions] of Object.entries(e)) {
                    const keys = multiKey.split("|").map(s => s.trim()).filter(Boolean);
                    for (const k of keys) {
                        out[k] ??= {}; // 未定義なら {} を入れる
                        
                        for (const [to, w] of Object.entries(transitions)) {
                            out[k][to] = (out[k][to] ?? 0) + w; // 既存値に加算
                        }
                    }
                }
                return out

            }
        );

        return out;
    }

    pick(dist){

        const InText = Object.entries(dist);
        if(InText.length == 0){return null}

        const sum = InText.reduce((s, [,p]) => s + p, 0);
        let r = Math.random() * sum;

        for(const [token,p] of InText){
            r -= p;
            if(r <= 0){return token};
        }

        return InText[InText.length - 1][0];
    }
    picka(){
        const InText = this.data_2.B;
        if(InText.length == 0){return null}

        const sum = InText.length;
        let r = Math.ceil(Math.random() * sum);


        return InText[r -1];
    }
    select(NowText,OutList){
        //data_2.Aの照合
        //もしあるのならpicka関数を実行。なければ、通常。

        const error_chek =[NowText,OutList,this.data,this.data_2,this.data_2.A,this.data_2.B];
        for(const e of error_chek){
            if(!e){
                logs.error(`{${e}} of Null`);
                return;
            }
        }

        if(this.data_2.A.includes(NowText)){
                return this.picka()
        }else{
            let dist = this.data[NowText];
            if((this.data_2.B.includes(NowText)) && !(Object.keys(this.data).includes(NowText))){  //もし、接続詞が含まれているかつ、通常にやつに接続しのあれが無い場合
                const das = OutList.length -2;
                dist = this.data[OutList[das]];
            }
            if(dist){return this.pick(dist)}else{
                return null;
            }
        }
    }
    gen(StartText,max){

        const CleIn = (ID,i) => {
            this.b++

            clearInterval(ID);
            logs.end(i);

            const OUT = OutList.join("");
            if(!logs.isErrorOnly){logs.result(OUT)}
            this.isFlag = false;
            return OUT

        }

        if(this.isFlag) return;       // 二重起動防止
        this.isFlag = true;

        logs.start();
        const OutList = [StartText]
        let NowText = StartText;
        let i = 0;
        const Interval = setInterval(()=>{

            
            const NextText = this.select(NowText,OutList); //次の文字の処理
            if(!NextText && !(NextText == "。")){logs.error(`NextText null => (${OutList[OutList.length -1]}) =>  次のテキストがないため、強制停止`);logs.result(CleIn(Interval,this.b)) ;return}; //NUllなら終了

            logs.process(NowText,NextText);

            OutList.push(NextText);
            NowText = NextText;
            i++;
            if(i >= max){CleIn(Interval,this.b)};
        },1)
    }
}

    const text = new Markov(list_data,T_2)




function ran_StTxet(){
    const a = ["こんにちは","やあ","もしもし","お疲れさま","どうも","やっほー","久しぶり"]

    const b = Math.ceil(Math.random() * a.length -1);

    return (a[b]).toString();
}

export function markov_text_generae(max_roop,max_generae){

    let i = 0;const max = max_roop;
    const IntervalID = setInterval(()=>{
        if(!text.isFlag){
            if(i >= max){clearInterval(IntervalID);text.b = 1;return}
            text.gen(ran_StTxet(),max_generae);
            i++
        }
},1)}