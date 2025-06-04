const express = require('express')
require('dotenv').config()

const mongoose = require('mongoose')
const tenantRoutes = require('./Routes/tenantRoutes')
const propertiesRoutes = require('./Routes/propertiesRoutes')
const maintenanceRoutes =  require('./Routes/maintenanceRoute')
const authRoutes = require('./Routes/authRoutes')
const cors = require('cors');




//express app
const app = express()

//middleware 
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json())


app.use((req,res,next) => {
    console.log(req.path, req.method)
    next()
})


//router
app.use('/api/tenant', tenantRoutes)
app.use('/api/properties', propertiesRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/user', authRoutes)


//connect to db
mongoose.connect(process.env.MONGO_URI)
.then(() =>{
    //listening
    app.listen(process.env.PORT, () =>{
    console.log('Connected to DB & listening on PORT', process.env.PORT)
})
})
.catch((error) => {
    console.log(error);
    
})


//mongoose to connect to db
// //connect to db
// mongoose.connect(process.env.MONGO_URI)
// .then(() =>{
//     //Listen for Request
// app.listen(process.env.PORT, ()=>{
//     console.log('Connected to DB & Listening on port', process.env.PORT);
// })
// })
// .catch((error) => {
//     console.log(error)
// })