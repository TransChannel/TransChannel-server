const fs = require("fs")

const config = fs.readFileSync("../config.json")

module.exports.getConfig = () => {
    return JSON.parse(config.toString())
}

module.exports.getLoggingConfig = () => {
    let config = {
        appenders: {
            app: {
                type: "dateFile",
                filename: "application.log",
                pattern: "yyyy-MM-dd",
                compress: true
            },
            auth: {
                type: "dateFile",
                filename: "authorization.log",
                pattern: "yyyy-MM-dd",
                compress: true
            }
        },
        categories: {
            default: {
                appenders: ["app", "auth"],
                level: "info"
            }
        }
    }
    config.categories.default.level = process.env.LOG_LEVEL || "info"
    return config
}