const mysql = require("mysql2")
const {getConfig} = require("./config_utils")
const {getConnection} = require("./sql_utils")

const connectPool = mysql.createPool(getConfig()["mysql"])

module.exports.getConnection = () => {
    return connectPool
}

module.exports.getUserByName = (username) => {
    return getConnection().query(`SELECT * FROM users WHERE username='${username}'`, (err, rows) => {
        if (err) {
            throw err
        } else {
            if (rows) {
                return rows
            } else {
                return
            }
        }
    })
}

module.exports.getUserById = (id) => {
    return getConnection().query(`SELECT * FROM users WHERE id='${id}'`, ((err, result) => {
        if (err) {
            throw err
        } else if (result) {
            return result
        } else return
    }))
}

module.exports.getFile = (uuid) => {
    return getConnection().query(`SELECT * FROM files WHERE uuid='${uuid}'`, ((err, result) => {
        if (err) {
            throw err
        } else if (result) {
            return result
        } else return
    }))
}