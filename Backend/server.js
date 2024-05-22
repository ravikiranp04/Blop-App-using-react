//create express app
const exp=require("express")
const app=exp()
const cors = require('cors');
// Define the allowed origins
const allowedOrigins = ['https://ravi-blog1.netlify.app'];

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the incoming origin is in the allowed origins list
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, // Allows cookies to be sent
  preflightContinue: false,
  optionsSuccessStatus: 204 // Some legacy browsers (e.g., IE11) choke on 204
};

// Use the CORS middleware with the options defined
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
const path=require('path') //core module
//accessing content of enviroment variable file
require('dotenv').config()//process.env.PORT
//---------------------------------------
//Import the apis
const userApp=require('./APIs/user-api')
const authorApp=require('./APIs/author-api')
const adminApp=require('./APIs/admin-api')
//--------------------------------------------------

//handover req to specific route based on start of paths
app.use('/user-api',userApp)
app.use('/author-api',authorApp)
app.use('/admin-api',adminApp)


//-------------------------------------------------------
//add body parser
app.use(exp.json())
app.use(exp.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
//------------------------------------------------------------

//Replace react build in http web server
app.use(exp.static(path.join(__dirname,'../frontend/build')))




//-----------------------------
//Error Handler
app.use((res,req,next,err)=>{
    res.send({status:"Error",message:err.message})
})

//Link with mongodb server
const mongoClient=require('mongodb').MongoClient //importing
mongoClient.connect(process.env.DB_URL)
.then(client=>{
    //get database object
    const blogDBObj=client.db('blogdb')
    //create collection objects
    const usersCollection=blogDBObj.collection('users')
    const authorsCollection=blogDBObj.collection('authors')
    const articlesCollection=blogDBObj.collection('articlesCollection')
    //share collection objs with APIS
    app.set('usersCollection',usersCollection)
    app.set('authorsCollection',authorsCollection)
    app.set('articlesCollection',articlesCollection);
    console.log('DB connection success')
})
.catch(err=>{
    console.log("Err in DB connect",err)
})






















//Syncronous error handling middleware
app.use((err,req,res,next)=>{
    res.send({status:"error",message:err.message})
})

//-------------------------------------------------------------------

//get port number from .env
const port=process.env.PORT || 4000
//Assign port number to http server
app.listen(port,()=>{console.log(`server on ${port}`)})