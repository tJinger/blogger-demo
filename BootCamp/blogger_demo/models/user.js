let mongoose = require('mongoose')
let bcrypt = require('bcrypt')
let nodeify = require('bluebird-nodeify')

require('songbird')

const SALT = bcrypt.genSaltSync(10)

let UserSchema = mongoose.Schema({
  username: {
  	type: String,
  	required: true
  },
  email: {
  	type: String,
  	required: true
  },
  password: {
  	type: String,
  	required: true
  },
  blogTitle: String,
  blogDescription: String
})


UserSchema.methods.generateHash = async function(password) {
  return await bcrypt.promise.hash(password, SALT)
}

UserSchema.methods.validatePassword = async function(password) {
  return await bcrypt.promise.compare(password, this.password)
}

UserSchema.pre('save', function(callback) {
  nodeify(async() => {
    if (! this.isModified('password')) return callback()
    this.password = await this.generateHash(this.password)
    console.log(this.password)
  }(), callback)
})

UserSchema.path('password').validate((password) => {
   return password.length >= 4 && /[A-Z]/.test(password) && /[a-z]/.test(password) && 
	  /[0-9]/.test(password)
})

module.exports = mongoose.model('User', UserSchema)
