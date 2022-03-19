const {getConnection} = require("../utils/sql_utils")
const {existsSync, mkdirSync} = require("fs")
const {v4} = require("uuid")
const {getSaltedPassword, getLogger, getRandomString} = require("../utils/utils")

const appLogger = getLogger("app")

module.exports.init = () => {
    if (!existsSync("/data")) {
        mkdirSync("/data")
    }
    getConnection().query("CREATE TABLE IF NOT EXISTS `users`(`id` INT NOT NULL,`username` varchar(255) NOT NULL,`password` varchar(255) NOT NULL,`salt` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `create_date` BIGINT NOT NULL, PRIMARY KEY (id), UNIQUE (username))")
    getConnection().query("CREATE TABLE IF NOT EXISTS `files`(`uuid` varchar(255) NOT NULL, `owner` INT NOT NULL, `path` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `upload_date` BIGINT NOT NULL, PRIMARY KEY (uuid))")
    if (!getConnection().query("SELECT * FROM users WHERE username='admin'")[0]) {
        appLogger.info("admin account does not exists, creating...")
        let salt = v4()
        let randomPassword = getRandomString(8)
        let saltedPassword = getSaltedPassword(randomPassword, salt)
        getConnection().query(`INSERT INTO users(\`username\`, \`password\`, \`salt\`, \`type\`, \`create_date\`) VALUES('admin', '${saltedPassword}', '${salt}', 'admin', '${Math.round(new Date().getTime() / 1000)}')`)
        appLogger.info(`username: admin   password: ${randomPassword}`)
    }
}