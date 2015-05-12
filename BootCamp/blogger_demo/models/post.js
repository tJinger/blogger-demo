let mongoose = require('mongoose')
require('songbird')

let PostSchema = mongoose.Schema({
  username: {
    type: String, 
    require: true
  },
  title: {
  	type: String,
  	required: true
  },
  content: {
  	type: String,
  	required: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  createDate: {
    type: Date,
    default: Date.now
  }, 
  updateDate: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Post', PostSchema)
