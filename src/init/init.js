const {getConnection} = require("../utils/sql_utils")
const {existsSync, mkdirSync} = require("fs")
const {v4} = require("uuid")
const {getSaltedPassword, getLogger, getRandomString} = require("../utils/utils")

const appLogger = getLogger("app")

module.exports.init = () => {
    if (!existsSync("/data")) {
        mkdirSync("/data")
    }
    getConnection().query("CREATE TABLE IF NOT EXISTS `users`(`id` INT NOT NULL AUTO_INCREMENT,`username` varchar(255) NOT NULL,`password` varchar(255) NOT NULL,`salt` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `create_date` BIGINT NOT NULL, PRIMARY KEY (id), UNIQUE (username))")
    getConnection().query("CREATE TABLE IF NOT EXISTS `files`(`uuid` varchar(255) NOT NULL, `owner` INT NOT NULL, `path` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `upload_date` BIGINT NOT NULL, PRIMARY KEY (uuid))")
    let admins
    getConnection().query("SELECT * FROM `users` WHERE username='admin'", (err,result) => {
        if (err) throw err
        else admins = result
    })
    console.log(admins)
    if (!admins) {
        appLogger.info("admin account does not exists, creating...")
        let salt = v4()
        let randomPassword = getRandomString(8)
        let saltedPassword = getSaltedPassword(randomPassword, salt)
        getConnection().query(`INSERT INTO users(\`username\`, \`password\`, \`salt\`, \`type\`, \`create_date\`) VALUES('admin', '${saltedPassword}', '${salt}', 'admin', '${Math.round(new Date().getTime() / 1000)}')`, (err) => {
            if (err) {
                appLogger.info(`admin existed`)
            } else {
                appLogger.info(`username: admin   password: ${randomPassword}`)
            }
        })
    }
}