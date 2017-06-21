const path = require('path')

const Positioner = require('electron-positioner')
const {app, Tray, BrowserWindow} = require('electron')

const opts = {
    iconPath: path.join(__dirname, 'icons', 'IconTemplate.png'),
    width: 400,
    height: 400,
    show: false,
    frame: false,
    index: `file://${path.join(__dirname, 'render', 'index.html')}`
}

let window
let tray 
let positioner
let cachedBounds


app.on('ready', appReady)

function appReady() {
    tray = new Tray(opts.iconPath)
    tray.on('click', trayClicked)
    tray.on('double-click', trayClicked)

    app.dock.hide()
    
    createWindow()
    hideWindow()

    function trayClicked(e, bounds) {
        
        if (window && window.isVisible()) {
            return hideWindow()
        }

        cachedBounds = bounds || cachedBounds
        showWindow(cachedBounds)
    }

    function createWindow() {
        window = new BrowserWindow(opts)
        positioner = new Positioner(window)

        window.on('blur', () => {
            hideWindow()
        })

        window.setVisibleOnAllWorkspaces(true)
        
        window.on('close', windowClear)
        window.loadURL(opts.index)
    }

    function showWindow(trayPos) {
        tray.setHighlightMode('always')

        if (!window) {
            createWindow()
        }

        if (trayPos && trayPos.x !== 0) {
            cachedBounds = trayPos
        } else if (cachedBounds) {
            trayPos = cachedBounds
        } else if (tray.getBounds()) {
            trayPos = tray.getBounds()
        }

        var noBoundsPosition = null
        if ((trayPos === undefined || trayPos.x === 0)) {
            noBoundsPosition = (process.platform === 'win32') ? 'bottomRight' : 'topRight'
        }

        var position = positioner.calculate(noBoundsPosition || 'trayCenter', trayPos)

        
        const x = (opts.x !== undefined) ? opts.x : position.x
        const y = (opts.y !== undefined) ? opts.y : position.y

        window.setPosition(x, y)
        window.show()
    }

    function hideWindow() {
        tray.setHighlightMode('never')
        
        if (!window) {
            return
        }

        window.hide()
    }

    function windowClear() {
        window = null
    }
}