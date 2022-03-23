module.exports.getConfig = () => {
    const config = require("../../config")
    return config.config
}

module.exports.getLoggingConfig = () => {
    let logginConfig = {
        appenders: {
            app: {
                type: "dateFile",
                filename: "logs/application.log",
                pattern: "yyyy-MM-dd",
                compress: true
            },
            auth: {
                type: "dateFile",
                filename: "logs/authorization.log",
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
    logginConfig.categories.default.level = process.env.LOG_LEVEL || "info"
    return logginConfig
}