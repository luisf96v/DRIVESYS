//Data base file initialization
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://127.0.0.1:27017/drive', { useNewUrlParser: true })
    .then(e => console.log('Database MongoDB Successfully Connected.'))
    .catch(e => console.error('Database Not Connected: ', e));
//|| 'mongodb://develop:develop2018@ds113693.mlab.com:13693/tang-app'


module.exports = mongoose;