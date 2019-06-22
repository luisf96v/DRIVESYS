//Data base file initialization
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
mongoose.connect(`mongodb://${global.__MONGO_USER&&global.__MONGO_USER+':'+global.__MONGO_PASS+'@'}127.0.0.1:27017/drive`, { useNewUrlParser: true , useFindAndModify: false })
    .then(() => console.log('Sucessfully connected to Mongo DB.'))
    .catch(e => console.error('Database Not Connected: ', e));
module.exports = mongoose;