const express = require("express")
const {createUser, login, changePassword} = require("../controllers/user")
const {getLogger} = require("../utils/utils")
const {uploadFile, getFile, downloadFile} = require("../controllers/files")

const app = express()
const port = process.env.PORT || 8080
const logger = getLogger("app")

module.exports.start = () => {

    app.post("/user/create", createUser)
    app.post("/user/login", login)
    app.post("/user/changePassword", changePassword)

    app.post("/file/upload", uploadFile)
    app.post("/file/get", getFile)
    app.post("/file/download", downloadFile)

    app.listen(port, () => {
        logger.info(`服务器启动，正在监听http://localhost:${port}`)
    })
}