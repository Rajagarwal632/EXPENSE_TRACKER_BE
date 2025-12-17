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
        date : new Date(date),
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
        date : new Date(date),
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

expenseroute.get("/date", userauth, async function(req,res){
    const userid = req.userid
    const year_month = req.query.month
    if (!year_month) {
        return res.json({ msg: "month is required (YYYY-MM)" });
    }
    const [year,month] = year_month.split("-")
    const start_date = new Date(Date.UTC(year,month-1,1))
    const end_date = new Date(Date.UTC(year , month,1))

    const match  = {
        userid : new mongoose.Types.ObjectId(userid),
        date : {"$gte" : start_date , "$lt" : end_date}
    }
    const result = await expensemodel.aggregate([{
        $match : match
    },{
        $group : {
            _id  : "$type",
            total : {$sum : "$amount"}
        }
    }
    ])
    let income = 0
    let expense = 0
    result.forEach(item => {
        if(item._id == "income") income = item.total;
        if(item._id == "expense") expense = item.total;
    })
    let balance = income - expense
    res.json({
        msg : "SUMMARY",
        month: year_month,
        income,
        expense,
        balance
    });
})

expenseroute.get("/report" , userauth , async function(req,res){
    const userid = new mongoose.Types.ObjectId(req.userid)
    const month = Number(req.query.month)||6
    //1 OVERALL SUMMARY - INCOME , EXPENSE , BALANCE
   const overall = await expensemodel.aggregate([{
    $match : {userid}
   },{
    $group : {
        _id : "$type",
        total : {$sum : "$amount"}
    }
   }])
   let total_income = 0
    let total_expense = 0
    overall.forEach(item => {
        if(item._id == "income") total_income = item.total;
        if(item._id == "expense") total_expense = item.total;
    })
    let total_balance = total_income - total_expense

    //3 CATEGORY WISE EXPENSE
    const match = {
 
        userid : userid,
        type : "expense"
    }

    const category_breakdown = await expensemodel.aggregate([{
        $match : match
    },{
        $group : {
            _id : "$category",
            total : {$sum : "$amount"}
        }
    },{
        $sort : {total : -1}
    }])

    //2 MONTHLY REPORT GENERATION
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - month)

    const monthly_raw = await expensemodel.aggregate([
        {
            $match: {
                userid: userid,
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    type: "$type"
                },
                total: { $sum: "$amount" }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1
            }
        }
    ])

    // raw data ko clean format me convert karna
    const monthly_map = {}

    monthly_raw.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`

        if (!monthly_map[key]) {
            monthly_map[key] = {
                month: key,
                income: 0,
                expense: 0
            }
        }

        monthly_map[key][item._id.type] = item.total
    })

    const monthly_report = Object.values(monthly_map)


    // =========================
    // FINAL RESPONSE
    // =========================
    res.json({
        msg : "TOTAL SUMMARY",
        overall: {
            income: total_income,
            expense: total_expense,
            balance: total_balance
        },
        monthlyReport: monthly_report,
        categoryBreakdown: category_breakdown
    })
})

module.exports = {
    expenseroute
}