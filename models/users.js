const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

//schema for users
const UserSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
})

// Handle different module export formats
const plugin = passportLocalMongoose.default || passportLocalMongoose;

UserSchema.plugin(plugin); // Uses username by default

module.exports=mongoose.model('User',UserSchema);