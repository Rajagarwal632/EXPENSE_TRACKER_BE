const mongoose = require("mongoose")
const { required } = require("zod/mini")
const Schema = mongoose.Schema
const objectid = Schema.ObjectId

mongoose.connect(process.env.MONGO_URL)

const user = new Schema({
    email : {type : String , unique : true , required : true},
    password : {type : String , required : true},
    name : String
})

const usermodel = mongoose.model("user" , user)

module.exports = {
    usermodel
}