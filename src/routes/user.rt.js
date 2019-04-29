const express = require('express')
const {Router} = express

const ctrl = require('../controllers/user.ctrl')

Router.get('/', ctrl.findAll)
Router.get('/org/:org', ctrl.findAllByOrg)
Router.get('/login', ctrl.login)
Router.post('/', ctrl.insert)
Router.put('/:id', ctrl.update)
Router.delete('/:id', ctrl.delete)
 
module.exports = Router