const {Router} = require("express")
const userroute = Router()

const {usermodel} = require("../config/db")

const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const saltround = 10
const {z, email} = require("zod")
const JWT_USER = process.env.JWT_USER

mongoose.connect(process.env.MONGO_URL)

userroute.post("/signup", async function(req,res){
    const reqbody = z.object({
        email : z.string().email(),
        password : z.string(),
        name : z.string()
    })
    const parsedatawithsucess = reqbody.safeParse(req.body)
    if(!parsedatawithsucess.success){
        res.json({
            msg : "INCORRECT FORMAT",
            error :parsedatawithsucess.error
        })
        return
    }
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name

    const hash_password = await bcrypt.hash(password,saltround)
    await usermodel.create({
        email,
        password : hash_password,
        name
    })
    res.json({
        msg : "USER CREATED"
    })

})

userroute.post("/signin", async function(req,res){

})

module.exports={
    userroute
}
