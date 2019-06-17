const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/org.ctrl')

router.get('/:id', ctrl.findOrgById)
//router.get('/:id/folders', ctrl.findFolderById)
router.get('/:id/root', ctrl.findFolderRootById)
router.get('/:id/dump', ctrl.findFolderDumpById)
router.get('/:id/users', ctrl.findUsersById)
router.get('/', ctrl.findAll)

router.post('/', ctrl.insert)

router.put('/:id', ctrl.update)

module.exports = router