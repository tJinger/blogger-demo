let fs = require('fs')
let multiparty = require('multiparty')
let DataUri = require('datauri')
let then = require('express-then')
let isLoggedIn = require('./middleware/isLoggedIn')
let Post = require('./models/post')
let Comment = require('./models/comment')
let time = require('time')(Date)

require('songbird')

module.exports = (app) => {
  let passport = app.passport

  app.get('/', (req, res) => {
    res.render('index.ejs')
  })

  app.get('/login', (req, res) => {
    res.render('login.ejs', {message: req.flash('error')})
  })

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }))

  app.get('/signup', (req, res) => {
    res.render('signup.ejs', {message: req.flash('error')})
  })
  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  app.get('/profile', isLoggedIn, then(async(req, res) => {
    let allPost = await Post.promise.find({username: req.user.username})
    let allComments = []
    allPost.forEach(function(post) {
      allComments.push(Comment.promise.find({postId: post._id}))
    })

    res.render('profile.ejs', {
      user: req.user,
      posts: allPost,
      comments: allComments,
      message: req.flash('error')
    })
  }))

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  app.get('/post/:postId?', isLoggedIn, then(async (req, res) => {
    let postId = req.params.postId
    if (!postId) {
      res.render('post.ejs', {
        post: {},
        verb: 'Create'
      })
      return
    }

    let post = await Post.promise.findById(postId)
    if (!post) res.send(404, 'Not found')

    let dataUri = new DataUri
    let image = dataUri.format('.'+post.image.contentType.split('/').pop(), post.image.data)
    res.render('post.ejs', {
      post: post,
      verb: 'Edit',
      image: `data:${post.image.contentType};base64,${image.base64}`
    })
  }))

  app.post('/post/:postId?', then(async (req, res) => {
    let postId = req.params.postId
    if (!postId) {
      let post = new Post()
      let [{title:[title], content:[content]},{image:[file]}] = await new multiparty.Form().promise.parse(req)

      post.username = req.user.username
      post.title = title
      post.content = content
      post.image.data = await fs.promise.readFile(file.path)
      post.image.contentType = file.headers['content-type']
      post.createDate = new Date()
      await post.save()
      res.redirect('/blog/' + encodeURI(req.user.blogTitle))
      return
    }

    let post = await Post.promise.findById(postId)
    if (!post) res.send(404, 'Not found')
    let [{title:[title], content:[content]},{image:[file]}] = await new multiparty.Form().promise.parse(req)
    post.title = title
    post.content = content
    post.updateDate = new Date()
    await post.save()
    res.redirect('/blog/' + encodeURI(req.user.blogTitle))
  }))

  app.get('/post/delete/:postId?', function(req, res, next) {
    Post.remove({_id: req.params.postId}, function(err, post) {
      res.redirect('/profile')
    })
  })

  app.post('/post/comment/:postId?', isLoggedIn, then(async (req, res) => {
    if (! req.body.comment) {
        return [false, {message: 'The comment cannot be empty.'}]
    }
    let postId = req.params.postId
    let comment = new Comment()
    
    let user = req.user
    comment.postId = postId
    comment.author = user.username
    comment.date = new Date()
    comment.content = req.body.comment
    await comment.save()
    res.redirect('/blog/' + encodeURI(req.user.blogTitle))
  }))

  app.get('/blog/:blogTitle?', isLoggedIn, then(async (req, res) => {
    let user = req.user
    let blogTitle = req.params.blogTitle

    let allPost = await Post.promise.find({username: user.username})
    if (!allPost) res.send(404, 'Not found')
    
    let allComments = []
    allPost.forEach(function(post) {
      allComments.push(Comment.promise.find({postId: post._id}))
    })

    res.render('blog.ejs', {
      blogTitle: blogTitle,
      posts: allPost,
      comments: allComments,
      message: req.flash('error')
    })
  }))
}
