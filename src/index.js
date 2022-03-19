const {init} = require("./init/init")
const {start} = require("./route/index")
const {getLogger} = require("./utils/utils")

const logger = getLogger("app")
logger.info("初始化...")
init()
logger.info("启动web服务器...")
start()