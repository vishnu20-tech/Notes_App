const mongoose=require('mongoose');
const Schema=mongoose.Schema;



//design schema for notes app
const NoteSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps: true});


//model for notes app
module.exports=mongoose.model('Note',NoteSchema);

