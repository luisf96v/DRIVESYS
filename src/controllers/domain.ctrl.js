const User = require('../models/user')
    , fs = require('file-system')

const DomainCtrl = {

    serveHTML : (res, name) => {
        res.setHeader('Content-Type', 'text/html')
        fs.readFile(`./html/${name}`, 'utf8', (err, data) => {
            if(err){
                console.log(err)
                res.render('error.html')
            } else {
                res.send(data)
            }
        })
    },
    
    mainPage: (req, res) =>
        User.findById(req.signedCookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2:
                        DomainCtrl.serveHTML(res, 'adminRoot.html')
                        break
                    case 3:
                        DomainCtrl.serveHTML(res,'adminRootViewOnly.html')
                        break
                    default:
                        DomainCtrl.serveHTML(res,'indexUsr.html')
                }
            })
            .catch(e => {
                res.cookie("muid", "", { maxAge: 0, overwrite: true})
                res.cookie("ouid", "", { maxAge: 0, overwrite: true})
                res.redirect('/login')
            }),

    login: (req, res) => (req.signedCookies.muid)? res.redirect('/') : DomainCtrl.serveHTML(res, 'login.html'),

    fileManagement: (req, res) =>
        User.findById(req.signedCookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2:
                        DomainCtrl.serveHTML(res,'fileManagement.html')
                        break
                    case 3:
                        DomainCtrl.serveHTML(res,'indexUsr.html')
                        break
                    default:
                        res.render('forbiden.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),

    adminUser: (req, res) =>
        User.findById(req.signedCookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2: case 4: case 5:
                        DomainCtrl.serveHTML(res,'adminUser.html')
                        break
                    default:
                        res.render('forbiden.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),

    dumpRoot: (req, res) =>
        User.findById(req.signedCookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2:
                        DomainCtrl.serveHTML(res,'dumpRoot.html')
                        break
                    default:
                        res.render('forbiden.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),
    dump: (req, res) =>
        User.findById(req.signedCookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2:
                        DomainCtrl.serveHTML(res,'dump.html')
                        break
                    default:
                        res.render('forbiden.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),
    admUsrNav: (req, res)=>
        User.findById(req.signedCookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                if(u.type)
                    res.setHeader('Content-Type', 'text/plain');
                switch (u.type) {
                    case 1: case 2:
                        res.end(`
                            <li class="panel">
                                <a id="panel1" href="javascript:;" data-toggle="collapse" data-target="#Dashboard"> <i
                                        class="fa fa-home"></i> Inicio
                                    <i class="fa fa-chevron-left pull-right" id="arow1"></i> </a>
                                <ul class="collapse nav" id="Dashboard">
                                    <li> <a href="javascript:goToStart()" id="bills"><i class="fa fa-angle-double-right"></i> Organizaciones</a> </li>
                                </ul>
                            </li>
                            <li class="panel">
                                <a id="panel9" href="javascript:goToDump();" data-toggle="collapse" data-target="#trash"> <i class="fa fa-trash"></i> Papelera de reciclaje </a>
                            </li>`)
                        break
                    default:
                        res.end(`
                        <li class="panel">
                            <a id="panel1" href="javascript:goToStart();" data-toggle="collapse" data-target="#Dashboard"> <i
                                    class="fa fa-home"></i> Inicio
                                <i class="fa fa-chevron-left pull-right" id="arow1"></i> </a>
                            <ul class="collapse nav" id="Dashboard">
                                <li> <a href="javascript:goToStart();" id="bills"><i class="fa fa-angle-double-right"></i> Inicio</a> </li>
                            </ul>
                        </li>`)
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),
    
}

module.exports = DomainCtrl