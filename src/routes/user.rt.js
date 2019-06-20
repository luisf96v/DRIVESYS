/*
    User API Router
    Path: /api/user
*/
const express = require('express')
const Router = express.Router()

/* 
    User controller
*/
const ctrl = require('../controllers/user.ctrl')

// @route GET api/user/
// @desc Gets all Users
Router.get('/', ctrl.findAll)

// @route GET api/user/info
// @desc Gets logged user by id
Router.get('/info', ctrl.findByID)

// @route POST api/user
// @desc Inserting new user
Router.post('/', ctrl.insert)

// @route PUT api/user/id?
// @desc Updating User
Router.put('/:id?', ctrl.update)

// @route DELETE api/user/id?
// @desc Deleting User
Router.delete('/:id', ctrl.delete)

/*
    Authentication Routes
*/

// @route GET api/user/auth/logout
// @desc Gets all Users
Router.get('/auth/logout', ctrl.logout)

// @route POST api/user/auth
// @desc Gets User Email Data 
Router.post('/auth', ctrl.findByEmail)

// @route POST api/user/auth/login
// @desc User Login
Router.post('/auth/login', ctrl.login)

// @route PUT api/user/auth/login
// @desc changes user password & updates password on reset
Router.put('/auth', ctrl.updatePwd)

// @route PUT api/user/reset
// @desc Reseting Password
Router.put('/auth/reset', ctrl.updatePwdReset)

module.exports = Router