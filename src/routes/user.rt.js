const express = require('express')
const Router = express.Router()

const ctrl = require('../controllers/user.ctrl')

Router.get('/', ctrl.findAll)
Router.get('/auth/logout', ctrl.logout)
Router.post('/auth', ctrl.findByEmail)
Router.post('/auth/login', ctrl.login)
Router.put('/reset', ctrl.updatePwdReset)
Router.put('/auth', ctrl.updatePwd)

Router.post('/', ctrl.insert)
Router.put('/:id?', ctrl.update)
Router.delete('/:id', ctrl.delete)
 
module.exports = Router