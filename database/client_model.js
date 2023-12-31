const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const tokenSchema = new mongoose.Schema({
  value: {
    type: String,
    unique:true
  }
});

const incart_serviceSchema = new mongoose.Schema({
  service_title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  service_desc: {
    type: String,
    trim: true
  },
  service_img: {
    type: String,
    trim: true
  },
  price: {
    type: Number, 
    required: true
  },
  isfixed: Boolean
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  confirmpassword: {
    type: String,
    required: true
  },
  otp: Number,
  tokens: [tokenSchema],
  services: [incart_serviceSchema]
});

userSchema.methods.generatetoken = async function(){
  try {
      const token = await jwt.sign({_id: this._id.toString()}, `tokenforsecuritypurpose`)
      this.tokens = this.tokens.concat({value:token}) 
      await this.save()   
      return token
  } 
  catch (error) {
      console.log(error);
  }
}

userSchema.pre('save', async function(next){
  if(this.isModified('password'))
  {
      this.password = await bcrypt.hash(this.password,10)
      this.confirmpassword = this.password
  }
  next()
})


const Clients = new mongoose.model("Client",userSchema)

module.exports = Clients