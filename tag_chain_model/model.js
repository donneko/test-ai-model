import {data} from "./data.js";

class tool {
    // リストの追加.追加したいリストを追加(もうあるタグはスキップされる)入力はリストのみ.(比較元,比較するもの)
    AddList_SkipAvailable(add_list_origin,add_list_request){
        if(!(Array.isArray(add_list_origin)) || !(Array.isArray(add_list_request)))return add_list_request || [];
        if((add_list_origin.length === 0))return add_list_request;
        const add_list = [];
        const list = [];

        // 一度全てまとめる
        add_list.push(...add_list_origin);
        add_list.push(...add_list_request);

        list.push(...this.RemoveDuplicates_in_List(add_list))
        return list;
    }

    // リスト内の重複を削除
    RemoveDuplicates_in_List(request_list){
        if(!(Array.isArray(request_list)) || (request_list.length === 0))return request_list;
        const add_list = [];
        for(const t of request_list){
            const isNew = !add_list.includes(t);
            if(isNew) add_list.push(t);
        }
        const origin_list = []
        origin_list.push(...add_list)
        return origin_list;
    }
}

// モデルの中心クラス
class TagModel {
    constructor(data,tool){
        this.lang_data = data;
        this.tool = tool;
    }
}

// タグやKEYの検索クラス
class TagModelSearch extends TagModel{
    constructor(data,tool){
        super(data,tool)
    }
    // KEYの名前を検索して、tagとnext_tagをオブジェクトで返す
    Text_Search_DataOutput(Selected_Text){
        if(!Selected_Text)return {tag:[],next_tag:[],};
        const data_list = this.lang_data[Selected_Text];
        if(!data_list)return {tag:[],next_tag:[],};
        return {tag:data_list.tag,next_tag:data_list.next_tag,};
    }
    // リスト形式のKEYの名前を検索して、tagとnext_tagをオブジェクトで返す(Text_Search_DataOutput()をリストに簡易的に対応させたもの)
    Textlist_Search_DataOutput(text_list){
        if(!(Array.isArray(text_list)) || (text_list.length === 0))return;
        const list = [];
        for(const obj of text_list){
            const data_obj = this.Text_Search_DataOutput(obj);
            list.push(...data_obj.tag);
        }
        return list;
    }

    // タグを[AND]または[OR]検索して、マッチしたら全てのKEYをリストで返す。もしリクエストがないのなら全てを出す。
    TagNext_Search_TextOutput(Selected_TagList,mode = "and"){
        if(mode !== "and" && mode !== "or") mode = "and";
        if(!Array.isArray(Selected_TagList) || (Selected_TagList.length === 0))return Object.keys(this.lang_data);
        const TagList = [...Selected_TagList];
        const match_key = []
        for(const[key,{tag}] of Object.entries(this.lang_data)){
            let match;
            if(mode==="and"){
                match = TagList.every(t => tag.includes(t));
            }else{
                match = TagList.some(t => tag.includes(t));
            }
            if(match)match_key.push(key);
        }
        return match_key
    }
}

// モデルのタグを編集するクラス
class TagModelEditing extends TagModel{
    constructor(data,tool){
        super(data,tool);
        this.TagsIHave = [];
    }
    
    // タグの編集処理.対応したデータならタグを保持しながら消去や追加ができる。
    tag_auto(){
        //今は何もしない。
        //TODO ここに入力されたデータに基づいて[tag_add][tag_remove]を自動せんたく
    }

    // タグの追加.追加したいタグを追加(もうあるタグはスキップされる)入力はリストのみ
    tag_add(add_tags){
        if(!(Array.isArray(add_tags)) || (add_tags.length === 0))return;
        const list = [];
        list.push(...this.tool.AddList_SkipAvailable(this.TagsIHave,add_tags))
        this.TagsIHave = list
    }

    // タグの消去.リストで入力されたものを消去する。
    tag_remove(remove_tags){
        if(!(Array.isArray(remove_tags)) || (remove_tags.length === 0))return;
        this.TagsIHave = this.TagsIHave.filter(t => !remove_tags.includes(t))
    }

    // タグの参照
    reference(){
        return this.TagsIHave
    }
}

// 生成クラス.生成や生成前後のデータ処理クラス
class TagModelGenerate extends TagModel{
    constructor(data,tool,search,editing){
        super(data,tool)
        this.search = search;
        this.editing = editing;
    }


    // 文章を作成.単語をリストで保存して、単語のTYPEで[終了]があれば文章作成終了。または、作成上限で終了。
    sentence_creation(word_request,sentence_count = 10,word_count = 1){
        if(!word_request || (typeof word_request)!=="string")return "【Error】word_request of There's nothing inside";
        if(!sentence_count || (typeof sentence_count)!=="number" || !(sentence_count > 0))return "【Error】sentence_count of There's nothing inside";
        if(!word_count || (typeof word_count)!=="number" || !(word_count > 0))return "【Error】word_count of There's nothing inside";

        const gen = (word_request,sentence_count,word_count) => {
            const obj_meta_DataList = [];
            const text_DataList = [];
            const sentence_list = [];
            let Next_request = word_request;
            for(let i=1;i<sentence_count;i++){
                const Obj_meta_data = this.short_sentence_creation(Next_request,word_count);
                obj_meta_DataList.push(Obj_meta_data)
                text_DataList.push(...Obj_meta_data.text)
                sentence_list.push(Obj_meta_data.text)
                const sentence_list_end = sentence_list.length -1;
                const next_list = sentence_list[sentence_list_end];
                const next_list_end = next_list.length -1;
                Next_request = next_list[next_list_end];
            }
            return{text_DataList:text_DataList,obj_meta_DataList:obj_meta_DataList,sentence_list:sentence_list}
        }

        const All_meta_data = gen(word_request,sentence_count,word_count);
        const {text_DataList,obj_meta_DataList,sentence_list} = All_meta_data;

        const output_text = text_DataList.join("")
        return output_text
    }

    // 短文を生成.出力{text:[テキスト],text_obj_data:[{text:'テキスト',ideas:[もしかしたらのテキスト],}],tags:[タグ],}
    short_sentence_creation(word_request,word_count = 1){
        if(!word_request || (typeof word_request)!=="string")return "【Error】word_request of There's nothing inside";
        if(!word_count || (typeof word_count)!=="number" || !(word_count > 0))return "【Error】word_count of There's nothing inside";
        // [tags]生成/検索部分
        const ObjData_AddTags  = (obj_data) => {
            const text_meta_data = obj_data;
            const text_list = []
            text_list.push(...text_meta_data.text)
            const tags_list = this.search.Textlist_Search_DataOutput(text_list);
            const R_tags_list = [];
            R_tags_list.push(...this.tool.RemoveDuplicates_in_List(tags_list));
            text_meta_data.tags.push(...R_tags_list);
            return text_meta_data
            
        }

        // 生成部分
        const gen = (word_request,word_count) =>{
            const data_object = {text:[],text_obj_data:[],tags:[]};
            const roop_count = word_count;
            const text_list = [word_request];
            for(let i = 0;i < roop_count;i++){
                const request_text_number = (text_list.length -1)
                const request_text = text_list[request_text_number];
                const return_data = this.word_creation(request_text,"normal+ideas")
                data_object.text_obj_data.push(return_data)
                text_list.push(return_data.text)
            }
            data_object.text.push(...text_list);
            return data_object;
        }
        const data_object = gen(word_request,word_count)
        const out_object = ObjData_AddTags(data_object);
        return out_object;
    }

    // 単語を作成
    word_creation(text_request,mode="normal"){
        if(!text_request || (typeof text_request)!=="string")return "【Error】text_request of There's nothing inside";
        if(mode !== "normal" && mode !== "normal+ideas")mode = "normal";
        const data_list  = this.search.Text_Search_DataOutput(text_request);
        const {tag,next_tag} = data_list; //tagは将来使うかもしれないので、放置。
        this.editing.tag_add(next_tag);
        const tag_list = this.editing.reference()
        const match_text_list = []
        match_text_list.push(...this.search.TagNext_Search_TextOutput(tag_list,"and")) //テストで["or"]あとで["and"]に戻すこと。
        const out_text = match_text_list[(Math.floor(Math.random() * match_text_list.length))]; // 仮でランダム出力。これあとからタグのパーセント連携をする。
        console.log(editing.reference())
        if(mode === "normal"){
            return  {text:out_text,ideas:[]};
        }else{
            return  {text:out_text,ideas:match_text_list};
        }
    }
}
const tools = new tool();
const model = new TagModel(data,tools);
const search = new TagModelSearch(data,tools);
const editing = new TagModelEditing(data,tools);
const generate = new TagModelGenerate(data,tools,search,editing);

// console.log("単語生成システムです。");console.log(generate.word_creation("こんにちは","normal+ideas"))
// console.log("短文生成システムです。");console.log(generate.short_sentence_creation("こんにちは",3))
console.log("長文生成システムです。");console.log(generate.sentence_creation("こんにちは",3,1));

// console.log(model.tool.AddList_SkipAvailable(["add","da"],["add","da","add","da","asdd","dadd"]))

// editing.tag_add(["add","be","code","doc"])
// console.log(editing.reference())
// editing.tag_add(["add","aidl","be","ecmo","rool"])
// console.log(editing.reference())

// console.log(model.tool.RemoveDuplicates_in_List(["add","a","ga","a","aa","aa","ag","a","ae","ea"]))
