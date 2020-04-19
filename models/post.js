const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom') // {} is because we only want JSDOM portion of the jsdom library
const dompurify = createDomPurify(new JSDOM().window) // create html and purify using JSDOM.window object

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    description:{
        type: String
    },
    markdown: {
        type: String,
        required: true
    }, 
    createdDate: {
        type: Date,
        default: Date.now
    },
    slug: { //Calculated once and saved in database as one time for each post
        type: String,
        require: true,
        unique: true
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
})

postSchema.pre('validate', function(next){
    //this function runs before any CRUD operation
    if(this.title){
        //set value for slug for current post
        this.slug = slugify(this.title, {lower: true, strict: true })
    }

    if(this.markdown){
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown))
    }

    next()
})

module.exports = mongoose.model('TravelPost', postSchema)