const log4js = require("log4js")
const {getLoggingConfig} = require("./config_utils")
const crypto = require("crypto")
const {v4} = require("uuid")
const {verify} = require("jsonwebtoken")
const {getSecretKey} = require("./utils")

let secretKey = crypto.createHash("sha1").update(v4()).digest("hex")

module.exports.getLogger = (category) => {
    log4js.configure(getLoggingConfig())
    return log4js.getLogger(category)
}

module.exports.getSaltedPassword = (password, salt) => {
    return crypto.createHash("sha1").update(`${password}/${salt}`).digest("hex")
}

module.exports.getSecretKey = () => {
    return secretKey
}

module.exports.decodeToken = (token) => {
    return verify(token, getSecretKey(), (err, decoded) => {
        if (err) {
            return
        } else {
            return decoded
        }
    })
}

module.exports.getRandomString = (length) => {
    let str = ""
    let dict = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for (let i = 0; i < length; i++) {
        str += dict[Math.round(Math.random() * 62)]
    }
    return str
}