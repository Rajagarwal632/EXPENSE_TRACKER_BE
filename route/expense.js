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

expenseroute.put("/:id" , userauth , async function(req,res){
    const userid = req.userid
    const dataid = req.params.id
    const reqbody = z.object({
        amount : z.number().optional(),
        category : z.string().optional(),
        description : z.string().optional(),
        date : z.string().optional(),
        type : z.enum(["income" , "expense"]).optional()
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

    const update = await expensemodel.findOneAndUpdate({
        userid : userid,
        _id : dataid 
    }, {
        amount,
        category,
        description,
        date,
        type
    })
    if(update){
        res.json({
            msg : "DATA UPDATED"
        })
    }else{
        res.json({
            msg : "DATA NOT EXIST OR CREDENTIALS WRONG"
        })
    }

})

expenseroute.delete("/:id",userauth , async function(req , res){
    const userid = req.userid
    const id = req.params.id
    const delete_data = await expensemodel.findOneAndDelete({
        userid : userid,
        _id : id
    })
    if(delete_data) {
        res.json({
            msg : "DATA DELETED"
        })
    }else{
        res.json({
            msg : "WRONG CREDENTIALS"
        })
    }
})

expenseroute.get("/category" , userauth , async function(req,res){
    const userid = req.userid
    console.log("REQ.USERID =", req.userid);

    const field = req.query.q
    const match = {
        //isko type cast krna hi hoga warna auth jo h wo string bhejta h userid me 
        //find() isiliy chalta kyuki schema bol raha hai userId ObjectId hai 
        // chal string ko ObjectId bana deta hoon
        //but aggregate() me no auto casting  so need to typecast 
        userid : new mongoose.Types.ObjectId(userid),
        type : "expense"
    }
    console.log("MATCH OBJECT =", match);

    if(field){
        match.category = field
    }
    const result = await expensemodel.aggregate([{
        $match : match
    },{
        $group : {
            _id : "$category",
            total : {$sum : "$amount"}
        }
    }])
    res.json({
        summary : result
    })
})

module.exports = {
    expenseroute
}