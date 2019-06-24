const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/file.ctrl')

/*router.post('/upload2/:folder', ctrl.upload.array('files'), (req, res)=> {
    res.sendStatus(200)
})*/
global.__ARR = new Map()

router.post('/upload/:folder', (req, res) => {
    try {
        global.__ARR.set(req.signedCookies.muid, [])

        req.on('close', () => {
            global.__ARR.get(req.signedCookies.muid).forEach(e => ctrl.deleteById(e))
            global.__ARR.delete(req.signedCookies.muid)
            res.sendStatus(408)
        })

        ctrl.upload(req, res, () => {
            global.__ARR.delete(req.signedCookies.muid)
            res.sendStatus(200)
        })
    } catch (err) {
        global.__ARR.get(req.signedCookies.muid).forEach(e => ctrl.deleteById(e))
        global.__ARR.delete(req.signedCookies.muid)
        res.sendStatus(500)
    }
})

router.get('/:id/:force?', ctrl.getFileStream)

router.put('/:id/restore', ctrl.restore)
router.put('/:id', ctrl.update)

router.delete('/:id/:permanent?', ctrl.delete)

module.exports = router