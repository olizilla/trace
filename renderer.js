// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const SVG_SCALE = 1
const conf = {
  turdsize: document.getElementById('turdsize').value,
  alphamax: document.getElementById('alphamax').value
}

let currentFilePath = null
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
      document.getElementById('svgs').innerHTML = Potrace.getSVG(SVG_SCALE)
      console.log('redrawn')
      converting = false
    })
  })
}

function handleFileSelect (evt) {
  evt.stopPropagation()
  evt.preventDefault()
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

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
['turdsize', 'alphamax', 'blacklevel'].map(
  id => document.getElementById(id).addEventListener('change', changeConfig)
)
