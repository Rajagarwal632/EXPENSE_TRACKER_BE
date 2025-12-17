const {Router} = require("express")
const expenseroute = Router()

const {expensemodel} = require("../config/db")

const mongoose = require("mongoose")
const {z} = require("zod")
const { userauth } = require("../middleware/userauth")
mongoose.connect(process.env.MONGO_URL)

expenseroute.post("/", userauth , async function(req,res){
    const userid = req.userid
    const reqbody = z.object({
        amount : z.number(),
        category : z.string(),
        description : z.string(),
        date : z.string(),
        type : z.enum(["income" , "expense"])
    })
    const parsedatawithsucess = reqbody.safeParse(req.body)
    if(!parsedatawithsucess.success){
        res.json({
            msg : "INCORRECT FORMAT",
            error : parsedatawithsucess.error
        })
        return
    }
    const amount = req.body.amount
    const category = req.body.category
    const description = req.body.description
    const date = req.body.date
    const type = req.body.type

    await expensemodel.create({
        userid,
        amount,
        type,
        category,
        date : date,
        description
    })
    res.json({
        msg : "DATA CREATED"
    })
})

expenseroute.get("/",userauth,async function(req,res){
    const userid = req.userid

    const data = await expensemodel.find({
        userid
    })
    res.json({
        msg : "LIST - : ",
        data
    })
})

module.exports = {
    expenseroute
}