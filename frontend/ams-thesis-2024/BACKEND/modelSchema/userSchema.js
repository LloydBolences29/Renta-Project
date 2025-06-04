const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator')

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
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'tenant', 'maintenance'],
        default: 'tenant'
    }
    // isActivated: {
    //     type: Boolean,
    //     default: true // Change based on activation logic
    // }
}, { timestamps: true });

//signup statics methiod
userSchema.statics.signup = async function (email, password, name, role) {
    
    //validator
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
      }
    //validate the email
    if(!validator.isEmail(email)){
        throw new Error('Email is not Valid');
    }
    if(!validator.isStrongPassword(password)){
        throw new Error('Password is not strong enough');
    }

    const exist = await this.findOne({ email });

    if (exist) {
        throw new Error('Email is already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({ email, password: hash, name, role });
    return user;
};


//login static method

userSchema.statics.login =  async function(email,password){
     //validator
     if(!email || !password){
        throw new Error('All field must be filled');
    }

    const user = await this.findOne({ email });

    if (!user) {
        throw new Error('Email is Incorrect');
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match){
        throw new Error('Password is Incorrect')
    }

    return user

}
   




const User = mongoose.model('User', userSchema);
module.exports = User;