var fs = require('fs')
const {dialog} = require('electron').remote

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const SVG_SCALE = 1
const conf = {
  turdsize: document.getElementById('turdsize').value,
  alphamax: document.getElementById('alphamax').value
}

let currentFilePath = null
let currentSvg = null
let converting = false

function convertToSvg (filepath) {
  if (converting) return console.log('conversion in progress')
  converting = true
  currentFilePath = filepath
  const Potrace = require('potrace')
  Potrace.setParameter(conf)
  Potrace.loadImage(filepath, function(err) {
    if (err) return console.error(err)
    Potrace.process(function(){
      currentSvg = Potrace.getSVG(SVG_SCALE)
      document.getElementById('svgs').innerHTML = currentSvg
      console.log('redrawn')
      converting = false
    })
  })
}

function handleFileSelect (evt) {
  evt.stopPropagation()
  evt.preventDefault()
  var help = document.querySelector('.help')
  help.innerText = 'Export'
  help.removeEventListener('click', saveFile)
  help.addEventListener('click', saveFile)
  var files = evt.dataTransfer.files
  for (let f of files) {
    convertToSvg(f.path)
  }
}

function handleDragOver (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function changeConfig (evt) {
  var prop = evt.target.id
  var value = evt.target.value
  console.log('change', prop, value)
  conf[prop] = Number(value)
  if (!currentFilePath) return
  convertToSvg(currentFilePath)
}

function saveFile () {
  dialog.showSaveDialog(function (fileName) {
    if (fileName === undefined) return;
    fs.writeFile(fileName, currentSvg, function (err) {
      if (err) console.error(err)
    })
  })
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
['turdsize', 'alphamax', 'blacklevel'].map(
  id => document.getElementById(id).addEventListener('change', changeConfig)
)
