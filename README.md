# Gallivanter
Social Web platform to share travel stories

## Site Features (covering Part1 & Part2 requirement)
- [x] **Add/Edit/Delete Posts**
    * User clicks on 'New' post button, new post page is displayed. On submit, new post is visible on index page
    * User clicks on 'Edit' button, edit page with current post values are displayed. On Submit, modified post is visible on index page
    * User clicks on 'Delete' button, post is removed from the index page
    **Note**: Posts are displayed in descending order of post creation date
- [x] **Read More**
    * User clicks on 'Read More' button, show page is displayed. It display's post details in read-only mode. The URL display's post title instead of id
    * User clicks on 'All posts' button to return to home page. Posts are displayed in descending order of date created (latest post on top)
    * User clicks on 'Edit' button to edit the post
- [x] **Search Posts**
    * User clicks on 'Search Post' button, Search page is displayed. User provides a search keyword, clicks submit. Posts with title 'containing' search keyword is displayed
    * Search result contains: post cards (if any), number of posts found, search keyword
- [x] **Dashboard - User KPI**
    * No. of posts
    * No. of Solo trip posts
    * No. of Hiking trip posts)
- [x] **Login/Sign-up**
    * Lazy-signup (User able to see read only posts before signing up)
    * Register
    * Login (used passport.js to maintain user's login session.)
- [x] **Login/Sign-up**
    * Lazy-signup (User able to see read only posts before signing up)
- [x] **Natural Language Input**
    * NLI based search results.
    * Used stopword module to strip common words from search keyword
    * Used 'And' condition to hit multiple search tokens
    * Used 'Or' condition when there is zero result from 'And' condition


## Technical Stack
Front-End | Back-End
------------ | -------------
HTML5 | Node.js (Express.js Framework)
Bootstrap | MongoDB (Mongoose library)

## Database Schema
### MongoDB Collection (Table) Schema:

**Collection Name: TravelPost**: (/models/post.js)
**TravelPost Schema**:
* **title**: {type:string, required: true}
* **description**: {type:string}
* **markdown**: {type:string, required: true}
* **createdDate**: {type:Date, default: Date.now}
* **slug**: {type: String, require: true, unique: true }
* **sanitizedHtml**: { type: String, required: true }

**Note**:
1. slug field is used to replace random id generated for post with post tile. 'Read more' page will show post title instead of post id in the URL. 
2. sanitizedHtml field is used to capture sanitize markdown value to prevent any kind on inadvertant/malicious attempt to break the HTML

**Collection Name: User**: (/models/post.js)
**TravelPost Schema**:
* **uid**: {type:string, required: true}
* **name**: {type:string, required: true}
* **email**: {type:string, required: true}
* **password**: {type:string, required: true}

## Screen reference
![Image of Gallivanter social web](https://github.com/sonalpdas-cmu/Gallivanter/blob/master/img/Galllivanter.PNG)

