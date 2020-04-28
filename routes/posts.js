const express = require('express')
const TravelPost = require('./../models/post')
const router = express.Router()
const sw = require('stopword')

router.get('/new', (req,res)=>{
    res.render('posts/new', { post: new TravelPost() })
})

router.get('/search', async (req, res) => {
    res.render('posts/search') 
})

router.post('/search', async (req, res) => {
    //const posts = await TravelPost.find('title:','/test/i')
    const searchKeyword = req.body.searchKeyword    
    const oldStrKeyword = searchKeyword.split(' ')
    const newStrKeyword = sw.removeStopwords(oldStrKeyword)
    console.log(newStrKeyword)
    if(newStrKeyword.length > 0) {
        var keywords = new Array();
        for(var i=0;i<newStrKeyword.length;i++){
            var re = new RegExp(newStrKeyword[i])
            keywords.push(re)
        }
        console.log(keywords)
        if(oldStrKeyword.indexOf("adventures") > -1 && oldStrKeyword.indexOf("hiking") >-1){
            var posts = await TravelPost.find({$and:[{title: {$regex: "adventures",'$options': "i"}},{title: {$regex: "hiking",'$options': "i"}}]}, function(err,docs){}).sort({
                createdDate: 'desc'
            })
        }
        else{
            var posts = await TravelPost.find({'title' : {$in: keywords}}, function(err,docs){}).sort({
                createdDate: 'desc'
            })
        }
       
        res.render('posts/search',{posts: posts, keyword: {searchKeyword}})  
    }
    else{
        res.render('posts/search')  
    }
})

router.get('/edit/:id', async (req,res)=>{
    const post = await TravelPost.findById(req.params.id)
    res.render('posts/edit', { post: post })
})

router.get('/:slug', async (req, res) => {
    const post = await TravelPost.findOne({ slug: req.params.slug })
    if(post == null) res.redirect('/') //If post is not found, redirect to home page
    res.render('posts/show',{ post: post })    
})

router.post('/',async (req, res, next) => {
    req.post = new TravelPost()
    next() //indicates router to go to next func which is 'savePostAndRedirect'
}, savePostAndRedirect('new'))


router.put('/:id',async (req, res, next) => {
    req.post = await TravelPost.findById(req.params.id)
    next() //indicates router to go to next func which is 'savePostAndRedirect'
}, savePostAndRedirect('edit'))


router.delete('/:id', async (req, res) => {
  await TravelPost.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

//Function to manage new and edit routes
function savePostAndRedirect(path) {
    return async (req,res) => {
        //Save post data to database
    
        let post = req.post
        post.title = req.body.title
        post.description = req.body.description
        post.markdown = req.body.markdown
        
        try{
            post = await post.save() //update post with new post
            res.redirect(`/posts/${post.slug}`)
        }catch(e){
            res.render(`posts/${path}`, { post: post })
        }
        
    }
}

module.exports = router