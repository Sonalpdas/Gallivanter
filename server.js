const express = require('express')
const mongoose = require('mongoose')
const TravelPost = require('./models/post')
const postRouter = require('./routes/posts')
const methodOverride = require('method-override')
const app = express()

mongoose.connect('mongodb://localhost/gallivanter',{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
})

var db = mongoose.connection
db.on('error', console.error.bind('MongoDB connection error:'))

app.set('view engine', 'ejs') //View engine converts ejs code to html

app.use(express.urlencoded({ extended: false })) //access all diff parameters from post route
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
    const posts = await TravelPost.find().sort({
        createdDate: 'desc'
    })

    //console.log("Database Entries: \n" + posts)
    res.render('posts/index', {posts: posts})
    
})

app.use('/posts',postRouter) //Should come after everything else
app.listen(5000)
