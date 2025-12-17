const mongoose = require("mongoose")
const { number, date } = require("zod")
const { required } = require("zod/mini")
const Schema = mongoose.Schema
const objectid = Schema.ObjectId

mongoose.connect(process.env.MONGO_URL)

const user = new Schema({
    email : {type : String , unique : true , required : true},
    password : {type : String , required : true},
    name : {type : String , required : true}
})

const expense = new Schema({
    userid : {type : objectid , required:true , ref : "user"},
    amount : {type : Number , required : true},
    type : {type : String , enum : ["income" , "expense"]},
    category : {type : String , required : true},
    date : {type : Date , required : true},
    description : {type : String , required : true}
})

const usermodel = mongoose.model("user" , user)
const expensemodel = mongoose.model("expense" , expense)

module.exports = {
    usermodel,
    expensemodel
}