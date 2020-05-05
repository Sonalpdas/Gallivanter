const express = require('express')
const TravelPost = require('./../models/post')
const router = express.Router()
const sw = require('stopword')
const profileVector = [] //in memory storing user profile vector of favorite posts
const avgKeywordScore = [] //in memory storing avg score of search keywords

router.get('/new', (req,res)=>{
    res.render('posts/new', { post: new TravelPost() })
})

router.get('/search', async (req, res) => {    
    res.render('posts/search') 
})

router.post('/search', async (req, res) => {
    //const posts = await TravelPost.find('title:','/test/i')
    
    let favoritePosts = await TravelPost.find({'favorite' : true}, function(err,docs){}).sort({
        createdDate: 'desc'
    })

    
    favoritePosts.forEach(async (post) => {
        const searchKeyword = post.title   
        const oldStrKeyword = searchKeyword.split(' ')
        const newStrKeyword = sw.removeStopwords(oldStrKeyword)
        console.log("fav post revised keyword: -> "+newStrKeyword)

        //add unique keywords in avgKeywordScore array
        newStrKeyword.forEach(async (keyword) => {
            var isItemExist = false
            if(avgKeywordScore.length == 0){
                avgKeywordScore.push({
                    keyword: keyword,
                    count: 1
                })
            }else{
                isItemExist = false
                avgKeywordScore.forEach(async (item) =>{
                    
                    if(item.keyword === keyword){
                        item.count = item.count + 1
                        isItemExist = true;
                    }
                    //console.log(keyword.keyword + ", and " +keyword.count)
                }) 
                if(isItemExist === false){
                    avgKeywordScore.push({
                        keyword: keyword,
                        count: 1
                    })
                }
            }
        })
       
        profileVector.push({
            postID: post._id,
            keywords: newStrKeyword
        })
    })

    //sorting vectors based on score
    var topKeywords = new Array();
    avgKeywordScore.sort((a, b) => (a.count < b.count) ? 1 : -1)
    avgKeywordScore.forEach(keyword =>{
        keyword.count = keyword.count/favoritePosts.length
        console.log(keyword.keyword + ", and " +keyword.count)
        var re = new RegExp(keyword.keyword)
        topKeywords.push(re)
    })
    console.log(avgKeywordScore.length)
    console.log('profileVector: '+ profileVector) 

    //Search logic starts here
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
        //console.log(keywords)

        /*
        //Revised search logic:
        var posts = await TravelPost.find({'title' : {$in: topKeywords}}, function(err,docs){})
        */

        
        //Old search logic:
        if(oldStrKeyword.indexOf("adventures") > -1 && oldStrKeyword.indexOf("hiking") >-1){
            var posts = await TravelPost.find({$and:[{title: {$regex: "adventures",'$options': "i"}},{title: {$regex: "hiking",'$options': "i"}}]}, function(err,docs){})

            //sorting posts based on profile vector
            
            var sortedPosts = []
            posts.forEach(post => {
                if(post.title.indexOf(avgKeywordScore[0].keyword) > -1){
                    sortedPosts.push(post)
                }
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
        if(path==='favorite'){
            post.favorite = true;
        }

        //console.log(post)
        
        try{
            post = await post.save() //update post with new post
            res.redirect(`/posts/${post.slug}`)
        }catch(e){
            res.render(`posts/${path}`, { post: post })
        }
        
    }
}

//Function to create user profile vector
function userProfileVector(){
    return async (req,res) => {
        let favoritePosts = await TravelPost.find({'favorite' : true}, function(err,docs){}).sort({
            createdDate: 'desc'
        })

        
        favoritePosts.forEach(async (post) => {
            const searchKeyword = post.title   
            const oldStrKeyword = searchKeyword.split(' ')
            const newStrKeyword = sw.removeStopwords(oldStrKeyword)
            console.log("fav post revised keyword: -> "+newStrKeyword)

            //add unique keywords in avgKeywordScore array
            newStrKeyword.forEach(async (keyword) => {
                var isItemExist = false
                if(avgKeywordScore.length == 0){
                    avgKeywordScore.push({
                        keyword: keyword,
                        count: 1
                    })
                }else{
                    isItemExist = false
                    avgKeywordScore.forEach(async (item) =>{
                        
                        if(item.keyword === keyword){
                            item.count = item.count + 1
                            isItemExist = true;
                        }
                        //console.log(keyword.keyword + ", and " +keyword.count)
                    }) 
                    if(isItemExist === false){
                        avgKeywordScore.push({
                            keyword: keyword,
                            count: 1
                        })
                    }
                }
            })
           
            profileVector.push({
                postID: post._id,
                keywords: newStrKeyword
            })
        })

        
        avgKeywordScore.forEach(keyword =>{
            keyword.count = keyword.count/favoritePosts.length
            console.log(keyword.keyword + ", and " +keyword.count)
        })
        console.log(avgKeywordScore.length)
        console.log('profileVector: '+ profileVector)   
        
      
        //profileVector = { '5ea840e2f7eca99f40101891': [1, 2, 3], '5ea78b170ed3ec643c2328e5': ['x', 'y', 'z'] }
    }
}


module.exports = router