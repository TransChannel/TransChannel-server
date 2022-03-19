const {getLogger, getSaltedPassword, getSecretKey, decodeToken} = require("../utils/utils")
const {v4} = require("uuid")
const {getConnection, getUserByName} = require("../utils/sql_utils")
const {sign} = require("jsonwebtoken")

const appLogger = getLogger("app")
const authLogger = getLogger("auth")

module.exports.createUser = async (req, res) => {
    /*
    * 请求示例：
    * {
    *   "user":{
    *     "username": "example",
    *     "password": "123456",
    *     "type": "teacher"
    *   }
    * }*/

    if (getUserByName(decodeToken(req.headers["x-access-token"]).username)["type"] === "admin") {
        appLogger.info(`${req.ip} is creating a user`)
        if (!req.body.user.username) {
            res.send({
                status: 400,
                message: "需要输入用户名"
            })
        } else {
            if (!req.body.user.password) {
                res.send({
                    status: 400,
                    message: "需要输入密码"
                })
            } else {
                let accountType = ["admin", "teacher", "classroom"]
                if (!req.body.user.type || !accountType.includes(req.body.user.type) ) {
                    res.send({
                        status: 400,
                        message: "未输入账号类型或账号类型错误"
                    })
                } else {
                    let salt = v4()
                    let saltedPassword = getSaltedPassword(req.body.user.password, salt)
                    getConnection().query(`INSERT INTO users(\`username\`, \`password\`, \`salt\`, \`type\`, \`create_date\`) VALUES('${req.body.user.username}', '${saltedPassword}', '${salt}', '${req.body.user.type}', '${Math.round(new Date().getTime() / 1000)}'‘)`)
                    appLogger.info(`${req.ip} registered ${req.body.user.type} user ${req.body.user.username}`)
                    authLogger.info(`${req.ip} registered ${req.body.user.type} user ${req.body.user.username}`)
                    res.send({
                        status: 200,
                        message: "注册成功"
                    })
                }
            }
        }
    } else {
        res.send({
            status: 403,
            message: "权限不足"
        })
    }
}

module.exports.login = async (req, res) => {
    /*
    * 请求示例：
    * {
    *   "user":{
    *     "username": "example",
    *     "password": "123456"
    *   }
    * }*/

    appLogger.info(`${req.ip} is logging in`)
    if (!req.body.user.username) {
        res.send({
            status: 400,
            message: "需要输入用户名"
        })
    } else {
        if (!req.body.user.password) {
            res.send({
                status: 400,
                message: "需要输入密码"
            })
        } else {
            try {
                let userInformation = getUserByName(req.body.user.username)
                if (userInformation.password === getSaltedPassword(req.body.user.password, userInformation.salt)) {
                    let token = sign({username: req.body.user.username}, getSecretKey())
                    res.send({
                        status: 200,
                        message: "登录成功",
                        token: token
                    })
                } else {
                    appLogger.info(`${req.ip}failed logging in ${req.body.user.username}`)
                    res.send({
                        status: 403,
                        message: "用户名或密码错误"
                    })
                }
            } catch (e) {
                res.send({
                    status: 500,
                    message: "数据库查询错误"
                })
            }
            /*直接查询
            getConnection().query("SELECT * FROM users WHERE ", (err, rows) => {
                if (err) {
                    res.send({
                        status: 500,
                        message: "数据库查询错误"
                    })
                    throw err
                } else {
                    if (req.body.user.username === rows[0].username
                        && getSaltedPassword(req.body.user.password, rows[0].salt) === rows[0].password) {
                        appLogger.info(`${req.body.user.username} successfully logged in at ${req.ip}`)
                        authLogger.info(`${req.body.user.username} successfully logged in at ${req.ip}`)
                        let token = sign({username: req.body.user.username}, getSecretKey())
                        res.send({
                            status: 200,
                            message: "登陆成功",
                            token: token
                        })
                    } else {
                        appLogger.info(`${req.ip}failed logging in ${req.body.user.username}`)
                        res.send({
                            status: 403,
                            message: "用户名或密码错误"
                        })
                    }
                }
            })*/
        }
    }
}

module.exports.changePassword = async (req, res) => {
    /*
    * 请求示例：
    * {
    *   "user":{
    *     "username": "example",
    *     "old_password": "123456",
    *     "new_password": "654321"
    *   }
    * }*/
    if (getUserByName(req.body.user.username)) {
        if (req.body.user.new_password) {
            if (decodeToken(req.headers["x-access-token"]).username === req.body.user.username) {
                //用户自行修改密码
                if (req.body.user.old_password) {
                    if (getSaltedPassword(req.body.user.old_password, getUserByName(req.body.user.username).salt) === getUserByName(req.body.user.username).password) {
                        getConnection().query(`UPDATE users SET password='${getSaltedPassword(req.body.user.new_password, getUserByName(req.body.user.username).salt)}' WHERE username='${req.body.user.username}'`)
                        appLogger.info(`the password of ${req.body.user.username} is changed by ${decodeToken(req.headers["x-access-token"]).username}`)
                        authLogger.info(`the password of ${req.body.user.username} is changed by ${decodeToken(req.headers["x-access-token"]).username}`)
                        res.send({
                            status: 200,
                            message: "修改成功"
                        })
                    } else {
                        res.send({
                            status: 403,
                            message: "密码错误"
                        })
                    }
                } else {
                    res.send({
                        status: 400,
                        message: "需要输入旧密码"
                    })
                }
            } else if (getUserByName(decodeToken(req.headers["x-access-token"]).username).type === "admin") {
                //管理员修改密码
                getConnection().query(`UPDATE users SET password='${getSaltedPassword(req.body.user.new_password, getUserByName(req.body.user.username).salt)}' WHERE username='${req.body.user.username}'`)
                appLogger.info(`the password of ${req.body.user.username} is changed by ${decodeToken(req.headers["x-access-token"]).username}`)
                authLogger.info(`the password of ${req.body.user.username} is changed by ${decodeToken(req.headers["x-access-token"]).username}`)
                res.send({
                    status: 200,
                    message: "修改成功"
                })
            } else {
                res.send({
                    status: 403,
                    message: "旧密码不正确"
                })
            }
        } else {
            res.send({
                status: 400,
                message: "需要输入新密码"
            })
        }
    } else {
        res.send({
            status: 404,
            message: "找不到用户"
        })
    }
}