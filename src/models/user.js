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
        match: /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9]+(?:\.([a-zA-Z0-9]{2,3}))+$/,
        unique: true
    },
     password: {
        type: String,
        bccrypt: true,
        rounds: 9,
        select: false,
        required: true
    },
    /*
        1 - Site admin
        2 - Host Site sub-admin
        3 - Host Site worker
        4 - Client Site admin
        5 - Client Site sub-admin
        6 - Client Site worker
    */
    type: {
        type: Number,
        required: true,
        max: 6,
        min: 1,
        select: false
    },
    org: {
        type: Schema.Types.ObjectId,
        ref: "Org",
        required: true,
        inmutable: true,
        select: false
    },
    passr: {
        type: Boolean,
        select: false,
        default: true,
        required: true
    }
}, { versionKey: false })

UserSchema.plugin(require('mongoose-bcrypt'))

module.exports = mongoose.model('User', UserSchema)