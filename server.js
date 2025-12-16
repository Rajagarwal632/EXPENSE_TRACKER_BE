require("dotenv").config()
const mongoose = require("mongoose")
const {userroute} = require("./route/user")
const express = require("express")
const app = express()

app.use(express.json())
app.use("/user",userroute)

async function main(){
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(process.env.PORT)
    console.log(`listening to port ${process.env.PORT}\nmongoose connected`)
}
main()