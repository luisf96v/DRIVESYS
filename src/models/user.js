const mongoose = require('mongoose')
const {Schema} = mongoose

const UserSchema = new Schema({
    name: { 
        type: String,
        required: true,
        max: 35
    },
    email: { 
        type: String, 
        max: 62, 
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email incorrecto.'],
        unique: [true, 'Unique email.']
     },
     password: {
         type: String,
         required: true,
         bccrypt: true,
         rounds: 9
     }
})

UserSchema.plugin(require('mongoose-bcrypt'))
module.exports = mongoose.model('User', UserSchema)