let nodeifyit = require('nodeifyit')
let LocalStrategy = require('passport-local').Strategy
let User = require('../models/user')

require('songbird')

module.exports = (app) => {
  let passport = app.passport

  passport.serializeUser(nodeifyit(async (user) => user._id))
  passport.deserializeUser(nodeifyit(async (id) => {
    return await User.promise.findById(id)
  }))

  passport.use(new LocalStrategy({
    usernameField: 'username',
    failureFlash: true
  }, nodeifyit(async (username, password) => {
    let user
    if(username.indexOf('@')) {
      let email = username.toLowerCase()
      user = await User.promise.findOne({email})
    } else {
        let regexp = new RegExp(username, 'i')
        user = await User.promise.findOne({
          username: {$regex: regexp}
      })
    }

    if (!user || !(username === user.username || username === user.email)) {
        return [false, {message: 'Invalid username'}]
    }
    if (!await user.validatePassword(password)) {
        return [false, {message: 'Invalid password'}]
    }
    
    return user
  }, {spread: true})))

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    failureFlash: true,
    passReqToCallback: true
  }, nodeifyit(async (req, email, password) => {
    email = (email || '').toLowerCase()
    if (await User.promise.findOne({email})) {
        return [false, {message: 'That email is already taken.'}]
    }
    
    let {username, title, description} = req.body

    let regexp = new RegExp(username, 'i')
    let query = {username: {$regex: regexp}}
    if (await User.promise.findOne(query)) {
        return [false, {message: 'That email is already taken.'}]
    }
    // create the user
    let user = new User()
    user.email = email
    user.username = username
    user.password = password
    user.blogTitle = title
    user.blogDescription = description
    return await user.save()
  }, {spread: true})))
}