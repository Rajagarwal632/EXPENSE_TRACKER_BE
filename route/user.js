const {Router} = require("express")
const userroute = Router()

const {usermodel} = require("../config/db")

const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const saltround = 10
const {z} = require("zod")
const JWT_USER = process.env.JWT_USER

mongoose.connect(process.env.MONGO_URL)

userroute.post("/signup", async function(req,res){
    
})

userroute.post("/signin", async function(req,res){

})

module.exports={
    userroute
}
