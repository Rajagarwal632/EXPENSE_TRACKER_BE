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
    const email = req.body.email
    const password = req.body.password

    const exist_user = await usermodel.findOne({
        email
    })
    if(!exist_user){
        req.json({
            msg : "USER NOT EXIST"
        })
        return
    }
    const password_match = await bcrypt.compare(password,exist_user.password)
    if(password_match){
        const token = jwt.sign({
            userid : exist_user._id 
        },JWT_USER)
        res.json({
            token : token
        })
    }else{
        res.json({
            msg : "WORNG PASSWORD"
        })
    }

})

module.exports={
    userroute
}
