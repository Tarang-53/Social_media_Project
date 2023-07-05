const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");


const app = express();
app.use(bodyParser.json() || bodyParser.urlencoded({extended:true}));
dotenv.config();


mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connected to mongodb atlas successfully.");
});

//middleWare
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);


// app.post("/register", function(req,res){
//     console.log(req.body);
//     res.send(req.body.name);
// });

app.listen(8888,function(){
    console.log("Server is live on port 3000")
})