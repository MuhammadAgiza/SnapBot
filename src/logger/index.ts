import * as winston from "winston"
import createProductionLogger from "./production.logger"
import createDevelopmentLogger from "./development.logger"


let logger: winston.Logger;


if (process.env.NODE_ENV === 'production') {
    logger = createProductionLogger();
} else {
    logger = createDevelopmentLogger();
}


export default logger;