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
         rounds: 9,
         select: false
     },
     type: {
         type: Number,
         required: true,
         max: 4,
         min: 0
     },
     org: {
         type: Schema.Types.ObjectId, 
         ref: 'Org',
         required: true
     }
})


module.exports = mongoose.model('User', UserSchema)