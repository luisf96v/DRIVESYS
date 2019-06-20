const express = require('express')
    , path = require('path')
    , mongoose = require('./db')
    , morgan = require('morgan')
    , app = express()
    , cookieParser = require('cookie-parser')
    , methodOverride = require('method-override')
    , favicon = require('serve-favicon')
    , useragent = require('express-useragent')
    , rateLimit = require('express-rate-limit')
    , helmet = require('helmet') //https://www.npmjs.com/package/helmet

//Settings 
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, '../www/'))
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(methodOverride('_method'))
app.use(cookieParser('7uM8fMm%uTmQ$aDm@5!T'))
app.use(express.static(path.join(__dirname, '../www/')))
app.use(favicon(path.join(__dirname, '../www/', 'favicon.ico')))
app.use(useragent.express())
app.use(helmet())
app.use('/api/*', rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 300, 
    message: "Muchas conexiadas creadas desde este IP, por favor intenta en 15 minutos hora."
  }))
app.use(morgan('dev')) //delete

//Routes

app.all('*', async (req, res, next) => {
    let ua
    if(ua = req.headers['user-agent']){
        let {isIE, isMobile} = useragent.parse(ua)
        if(isIE || isMobile){
            return res.redirect('/error.html')
        }
    }
    next()
})

const User = require('./models/user')
app.all('/api/*', async (req, res, next) => {
        if(req.originalUrl.match('/api/user/auth*') || (req.method == 'POST' && req.originalUrl.match('/api/org')))
            return next()

        let usr = await User.findOne({_id: req.signedCookies.muid}, {type: 1, passr: 1, org: 1})
                    .lean()
                    .populate('org', {enabled: 1})
        
        if(usr && !usr.passr && usr.org && usr.org.enabled)
            return next()
        
        res.cookie("muid", "", { maxAge: 0, overwrite: true})
        res.cookie("ouid", "", { maxAge: 0, overwrite: true})
        return res.redirect('/login')
})
app.use('/api/folder/', require('./routes/folder.rt'))
app.use('/api/org/', require('./routes/org.rt'))
app.use('/api/user/', require('./routes/user.rt'))
app.use('/api/file/', require('./routes/file.rt'))
app.use('/', require('./routes/domain.rt'))


//Starter
app.listen(app.get('port'), ()=> {
    console.log('Server started on port:', app.get('port'))
})
