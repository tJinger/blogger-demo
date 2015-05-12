let mongoose = require('mongoose')
require('songbird')

let CommentSchema = mongoose.Schema({
  postId: String,
  author: String,
  date: {
    type: Date,
    default: Date.now
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  content: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Comment', CommentSchema)