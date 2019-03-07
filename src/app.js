const express = require('express')
    , path = require('path')
    , mongoose = require('./db')
    , morgan = require('morgan')  
    , cookieParser = require('cookie-parser')
    , app = express();

//Settings 
app.set('port', process.env.PORT || 8080)
app.set('views', path.join(__dirname, '../www/'))
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)


//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../www/')))
app.use(morgan('dev')) //delete


//Routes
app.use('/api/user/', require('./routes/user.rt'))
app.get('/', (_, res) => res.render('index.html'))
app.use('*', (_, res) => res.render('error.html'))


//Starter
app.listen(app.get('port'), ()=> {
    console.log('Server started on port:', app.get('port'))
})
