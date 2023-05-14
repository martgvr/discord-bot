import fs from 'fs'
import log4js from 'log4js'

const logsFile = ['/application.log']

// LOGGER

log4js.configure({
    appenders: {
        out: { type: 'console', filename: 'application.log' },
        app: { type: 'file', filename: 'application.log' },
    },

    categories: {
        default: { appenders: ['out'], level: 'trace' },
        development: { appenders: ['out', 'app'], level: 'all' }
    }
})

export const logger = log4js.getLogger('development')

// HEADER

async function writeHeader(logFile) {
    const logPath = process.cwd() + logFile;
    const today = new Date(Date.now());
    const logHeader = `--------------------------------------------\n| Inicio de log\n| Sesión: ${today.toUTCString()}\n--------------------------------------------\n\n`
    
    try {
        const fileRead = await fs.promises.readFile(logPath, 'utf-8');
        const fileWrite = await fs.promises.writeFile(logPath, fileRead + (fileRead == '' ? logHeader : '\n' + logHeader));
    } catch (e) { console.log('Error! Algo salió mal') }
}

logsFile.forEach(logFile => writeHeader(logFile))