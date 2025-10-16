
// モデルの選択
class Model_Selection{
    constructor(){
        this.model_list =  {
            "markov_chain_model":{text:"マルコフ連続モデル",function_name:"markov_text_generae",},
            "tag_chain_model":{text:"タグ連鎖モデル",function_name:"word_text_generae",},
        }
        this.select_model = "markov_chain_model";
    }
    Output_model_name(){
        const model_data = this.model_list

        return Object.keys(model_data)
    }
    chenge_model(request){
        const model_name_list= Object.keys(this.model_list)
        if(!(model_name_list.includes(request))){console.error("存在しないモデル名です。");return}
        this.select_model = request
    }
    Now_select_model(){
        
        const tenpoary_data_list = {}

        Object.assign(tenpoary_data_list,(this.model_list[(this.select_model)]))

        tenpoary_data_list.model_name = this.select_model;

        
        // console.log(tenpoary_data_list)
        // function_name : "markov_text_generae"
        // model_name : "markov_chain_model"
        // text : "マルコフ連続モデル"


        return tenpoary_data_list;
    }
}

// 選択されたモデルで、生成。
class Generaete extends Model_Selection{
    async text_generate(NumberOfExecutions,NumberOfGenerae){
        const {tenpoary,model_function} = await this.model_load();


        const function_name = tenpoary[model_function];

        if(typeof function_name == "function"){
            function_name(NumberOfExecutions,NumberOfGenerae)
        }
    }
    async model_load(){
        const model_data = this.Now_select_model()
        const model_function = model_data.function_name
        const model_name = model_data.model_name

        const tenpoary = await import(`./${model_name}/model.js`);
        return {tenpoary:tenpoary,model_function:model_function};
    }
}

const a = new Generaete();


a.text_generate(100,5)
// a.chenge_model("tag_chain_model")
// markov_text_generae(2,20);--