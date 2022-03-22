const {getFile, getUserByName, getConnection} = require("../utils/sql_utils")
const {decodeToken, getLogger} = require("../utils/utils")
const {v4} = require("uuid")

let appLogger = getLogger("app")

module.exports.uploadFile = async (req, res) => {
    if (!req.file || Object.keys(req.file).length === 0) {
        res.status(400).send({
            status: 400,
            message: "请上传文件"
        })
    } else {
        let user = getUserByName(decodeToken(req.headers["x-access-token"]).username)
        let file = req.body.file[0]
        if (user.type === "admin" || user.type === "teacher" ) {
            appLogger.info(`${user.username} is trying to upload ${file.name}`)
            let uuid = v4()
            let path = __dirname + `/data/files/${uuid}/${file.name}`
            file.mv(path, (err) => {
                if (err) {
                    res.status(500).send({
                        status: 500,
                        message: err
                    })
                    throw err
                }
            })
            appLogger.info(`${user.username} uploaded ${file.name}`)
            res.status(200).send({
                status: 200,
                uuid: uuid,
                message: "上传成功"
            })
            getConnection().query(`INSERT INTO files(\`uuid\`, \`owner\`, \`path\`, \`name\`, \`upload_date\`) VALUES('${uuid}', '${user.username}', '${path}', '${file.name}', '${Math.round(new Date().getTime() / 1000)}')`)
        } else {
            res.status(404).send({
                status: 404,
                message: "权限不足"
            })
        }
    }
}

module.exports.getFile = async (req,res) => {
    if (!req.body.file.uuid) {
        res.status(400).send({
            status: 400,
            message: "请输入文件uuid"
        })
    } else {
        let file = getFile(req.body.file.uuid)
        if (file) {
            res.send(file)
        } else {
            res.status(404).send({
                status: 404,
                message: "找不到文件"
            })
        }
    }
}

module.exports.downloadFile = async (req, res) => {
    if (!req.body.file.uuid) {
        res.status(400).send({
            status: 400,
            message: "请输入文件uuid"
        })
    } else {
        let file = getFile(req.body.file.uuid)
        if (file) {
            if (getUserByName(decodeToken(req.headers["x-access-token"]).username)["type"] === "admin" ||
                getUserByName(decodeToken(req.headers["x-access-token"]).username)["type"] === "classroom" ||
                getUserByName(req.headers["x-access-token"]).username === file["owner"]) {
                appLogger.info(`${req.headers["x-access-token"].username} is downloading ${file["name"]}`)
                res.download(file["path"], file["name"], (err => {
                    throw err
                }))
            } else {
                res.status(403).send({
                    status: 403,
                    message: "权限不足"
                })
            }
        } else {
            res.status(404).send({
                status: 404,
                message: "找不到文件"
            })
        }
    }
}