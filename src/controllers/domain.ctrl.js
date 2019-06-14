const User = require('../models/user')

const DomainCtrl = {
    mainPage: (req, res) =>
        User.findById(req.cookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2:
                        res.render('adminRoot.html')
                        break
                    case 3:
                        res.render('adminRootViewOnly.html')
                        break
                    default:
                        res.render('indexUsr.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),

    login: (req, res) =>
        User.findById(req.cookies.muid).select('type passr')
            .then(u => { if(u.passr)throw "error";u.type && res.redirect('/')})
            .catch(() => res.render('login.html')),

    fileManagement: (req, res) =>
        User.findById(req.cookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2:
                        res.render('fileManagement.html')
                        break
                    case 3:
                        res.render('indexUsr.html')
                        break
                    default:
                        res.render('forbiden.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),

    adminUser: (req, res) =>
        User.findById(req.cookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2: case 4: case 5:
                        res.render('adminUser.html')
                        break
                    default:
                        res.render('forbiden.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),

    dumpRoot: (req, res) =>
        User.findById(req.cookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2:
                        res.render('dumpRoot.html')
                        break
                    default:
                        res.render('forbiden.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),
    dump: (req, res) =>
        User.findById(req.cookies.muid).select('type passr')
            .then(u => {
                if(u.passr)
                    throw 'error'
                switch (u.type) {
                    case 1: case 2:
                        res.render('dump.html')
                        break
                    default:
                        res.render('forbiden.html')
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),
    admUsrNav: (req, res)=>
        User.findById(req.cookies.muid).select('type passr')
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
                                    <li> <a href="" id="bills"><i class="fa fa-angle-double-right"></i> Organizaciones</a> </li>
                                </ul>
                            </li>
                            <li class="panel">
                                <a id="panel9" href="javascript:;" data-toggle="collapse" data-target="#trash"> <i class="fa fa-trash"></i> Papelera de reciclaje </a>
                            </li>`)
                        break
                    default:
                        res.end(`
                        <li class="panel">
                            <a id="panel1" href="javascript:;" data-toggle="collapse" data-target="#Dashboard"> <i
                                    class="fa fa-home"></i> Inicio
                                <i class="fa fa-chevron-left pull-right" id="arow1"></i> </a>
                            <ul class="collapse nav" id="Dashboard">
                                <li> <a href="" id="bills"><i class="fa fa-angle-double-right"></i> Inicio</a> </li>
                            </ul>
                        </li>`)
                }
            })
            .catch(e => {
                res.redirect('/login')
            }),
    
}

module.exports = DomainCtrl