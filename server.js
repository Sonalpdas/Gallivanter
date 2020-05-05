if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const TravelPost = require('./models/post')
const Users = require('./models/user')
const Favorite = require('./models/favorites')
const postRouter = require('./routes/posts')
const methodOverride = require('method-override')
const app = express()

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const intializePassport = require('./passport-config')
intializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
const users = [] //in memory storing registered user info. Use db instead

mongoose.connect('mongodb://localhost/gallivanter',{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
})

var db = mongoose.connection
db.on('error', console.error.bind('MongoDB connection error:'))

app.set('view engine', 'ejs') //View engine converts ejs code to html

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false })) //access all diff parameters from post route
app.use(methodOverride('_method'))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated,async (req, res) => {

    const posts = await TravelPost.find().sort({
        createdDate: 'desc'
    })

    console.log("Database Entries: \n" + posts)
    res.render('posts/index', {posts: posts, name: 'Welcome ' + req.user.name})
    
})

app.get('/login', checkNotAuthenticated, async (req,res) => {
    const posts = await TravelPost.find().sort({
        createdDate: 'desc'
    })
    res.render('login.ejs',{posts: posts})
})

app.get('/register', checkNotAuthenticated, (req,res) => {
    res.render('register.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req,res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let user = new Users({
            uid: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })  
        console.log(user)
        
        users.push({ 
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        
        res.redirect('/login')
    } catch{
        res.redirect('/register')
    }   
})

app.put('/favorite/:id',async (req, res) => {
    console.log('favorite function')
    var post = await TravelPost.findById(req.params.id)   
    post.favorite = true;
    post = await post.save() //update post with new post  
    console.log(post)  
    res.redirect('/')
})

app.use('/posts',postRouter) //Should come after everything else
app.delete('/logout', (req,res) => {
    req.logOut() //this func is passport sets up for us automatically, it will clear session and log user out.
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }

    next()
}

app.listen(5000)
