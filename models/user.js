const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, 
        minlength: 5,
        maxlength: 50
      },
    email: { 
        type: String,  
        required: true,
        unique:true,
        minlength:10,
        maxlength:50
      },
    password: { 
        type: String, 
        required: true,
        minlength: 5,
        maxlength: 1024
      },
    role:{
        type: String,
        enum:['mentor','learner'],
        required: true
    },
    workshops:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workshop'
    }]
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id, role: this.role },config.get('jwtPrivateKey'));
    return token;
  };

const User = mongoose.model('User', userSchema );

function validateUser(user) {
    const schema = {
      name: Joi.string().min(5).max(50).required(),
      email: Joi.string().min(5).max(50).required().email(),
      password: Joi.string().min(5).max(255).required()
      
    };
  
    return Joi.validate(user, schema);
  }
  
  exports.User = User; 
  exports.validate = validateUser;