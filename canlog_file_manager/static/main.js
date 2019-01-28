/**
 * Constants
 * 
 */
var slidesPerView = 6;
var CHUNK_SIZE = 10000;
var FAMOS_FILES = ['Error_Frames_1.raw', 'X Axis Acceleration.raw',
            'Y Axis Acceleration.raw', 'Z Axis Acceleration.raw'];
var FILE_COUNT = 17;

/**
 * Globals
 * 
 */
var map = null;
var csvFile = null;
var currentLatLng = null;
var swiper = null;
var folders = [];

var selected = null;

const BEARING_COLUMN = 0;
const HEIGHT_COLUMN = 1;
const LAT_COLUMN = 3
const LONG_COLUMN = 4;
const SPEED_COLUMN = 5;
const TIME_COLUMN = 6;

const X_AXIS = 7;
const Y_AXIS = 8;
const Z_AXIS = 9;

 /**
  * Clear the Canvas
  * 
  * @param {string} containerID the container
  * @param {string} canvasID the canvas to clear
  */
 function clearCanvas(parentID, canvasID) {
    $(`#${canvasID}`).remove(); 
    $(parentID).append(`<canvas id='${canvasID}' width="400" height="110" style="position:absolute; left:0px; right:0px; top:0px; bottom:20px;" />`);
 }

 /**
  * Inactivate the Tabs
  */
 function inactivateTabs() {
  var iTab, tabcontent, tabbuttons, tablinks;
   
   // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (iTab = 0; iTab < tabcontent.length; iTab++) {
      tabcontent[iTab].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (iTab = 0; iTab < tablinks.length; iTab++) {
      tablinks[iTab].className = tablinks[iTab].className.replace(" active", "");
      tablinks[iTab].style.textDecoration = "none";
  }

}

/**
* Show the Active Tab
* 
* @param {event} evt the Tab to Show
* @param {string} tab the name of the Tab
* @param {string} button the Tab's button
*/
function showTab(evt, tab, button) {

  inactivateTabs();

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tab).style.display = "block";
  document.getElementById(button).style.textDecoration = "underline";

  evt.currentTarget.className += " active";

}

/**
 * Build the Menu
 * @param {*} folders the folders to build 
 */
function buildMenu(folders) {
    var htmlFolders = "<a id='clear-folder' onclick='$(this).Clear()')>Clear</a>";

    if (folders.length > 0) {
        htmlFolders += "<hr></hr>";
    }

    var index = 0;

    for (folder in folders) {
        var click = '$(this).Select("' + escape(folders[folder]) + '","' + index + '")'
        var menuID = 'menu-' + folder
        htmlFolders += `<a id='${menuID}' onclick='${click}'> ${folders[folder]}</a>`;
        index += 1;
    }

    $('#dropdown').html(htmlFolders);

}

/**
 * Show the Charts
 * 
 * @param {*} columns 
 * @param {*} rows 
 */
function showCharts(columns, rows) {
  var dataSpeed = [];
  var dataHeight = [];
  var labels = [];

  var length = rows.length;
  var modulus = length >= 100000 ? 1000 : length >= 10000 ? 100 : 1;
  var totalSpeed = 0.0;

    clearCanvas('#speedFrame', 'speedChart');

    new Chart(document.getElementById("speedChart").getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
        datasets: [{ 
            data: dataSpeed,
            label: "Speed in Kmh",
            borderColor: "#3e95cd",
            fill: false
        }],
        options: {
        title: {    
            display: true,
            text: 'Speed of Vehicle'
        }
        }
    }
  
    }); 
   
    clearCanvas('#heightFrame', 'heightChart');

    new Chart( document.getElementById("heightChart").getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
        datasets: [{ 
            data: dataHeight,
            label: "Height in metres",
            borderColor: "#3e95cd",
            fill: false
        }],
        options: {
        title: {
            display: true,
            text: 'Terrain Height above Sea Level'
        }
        }
    }

    });

    $('#details').html('<b>Start Time: </b><p/>' + (new Date(Math.trunc(rows[0][TIME_COLUMN]) * 1000)) +
    '<p/><b>Finish Time: </b><p/>' + (new Date(Math.trunc(rows[count - 1][TIME_COLUMN]) * 1000)) +
    '<p/><b>Average Speed: </b><p/>' + ((totalSpeed/rows.length).toFixed(2)) + "&nbsp;kph" +
    '<p/><b>Top Speed: </b><p/>' + (topSpeed.toFixed(2)) + "&nbsp;kph" +
    '<p/><b>Distance Travelled: </b><p/>' + ((distanceKms).toFixed(2)) + "&nbsp;kms");

}

/**
 * Create a swiper control
 * @return the newly constructed swiper control
 * 
 */
function createSwipperControl() {

  var swiper = new Swiper('.swiper-container', {
    slidesPerView: slidesPerView,
    centeredSlides: false,
    spaceBetween: 10,
    breakpointsInverse: true,
    breakpoints: {
      200: {
        slidesPerView: 1,
        spaceBetween: 10
      },
      600: {
        slidesPerView: 2,
        spaceBetween: 10
      },    
      800: {
        slidesPerView: 3,
        spaceBetween: 10
      },    
      1000: {
        slidesPerView: 4,
        spaceBetween: 10
      },
      1200: {
        slidesPerView: 5,
        spaceBetween: 10
      },    
      1400: {
        slidesPerView: 6,
        spaceBetween: 10
      },   
      1600: {
        slidesPerView: 7,
        spaceBetween: 10
      },
      1800: {
        slidesPerView: 8,
        spaceBetween: 10
      },
      2000: {
        slidesPerView: 9,
        spaceBetween: 10
      },   
      2200: {
       slidesPerView: 10,
        spaceBetween: 11
      }
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

  });

  return swiper;

}

function generateSummarySlide(folder, timestamp) {
    var slide = 
    "<div class='swiper-slide' style='border:2px solid #0174DF; background-color: rgba(255,255,255, 0.30);' onclick='showMission(\"" + timestamp + "\");'> " + 
        "<div style='position:absolute; left:3px; top:5px; right:3px;'>" +
        "<div class='play'>" + 
        "<img src='" + playImage + "' style='width:32; height:32px; margin-top:100px;'/></div>" +
        "<table style='color:black;font-family: monospace; font-size: 12px;'>" +
        "<tr><td><label style='color:black;font-family: monospace; font-size: 14px; font-weight:bold'>" +
         (new Date(Math.trunc(timestamp) * 1000)) +
         "</label></td>" +  
        "</tr>" + 
        "</table>" +
        "</div>" +
        "<div style='position:absolute; left:3px; bottom:8px; right:3px; margin-bottom:-5px;'>" + 
            " <label style='color:black;font-family: monospace; font-size: 14px; width:100%; " + 
            " white-space: nowrap; overflow: hidden;text-overflow: ellipsis; display: inline-block;'>" +
            folder + "</label>" +
            "<div id='" + folder + '-' + timestamp + 
            "' style='position:absolute: left:0px; right:0px; bottom:0px; height:5px; margin-bottom:-4px; margin-left:-3px; margin-right:-3px;'><p></p></div>" +
        "</div>" +
    "</div>";

    return slide;

}

function generateStatusSlide(folder, timestamp) {
    var slide = 
    "<div class='swiper-slide' style='border:2px solid #0174DF; background-color: rgba(100, 100, 100, 0.60);'> " + 
        "<div style='position:absolute; left:3px; top:5px; right:3px;'>" +
        "<table style='color:black;font-family: monospace; font-size: 12px;'>" +
        "<tr><td><label style='color:white; font-family: monospace; font-size: 14px; font-weight:bold'>" + 
        (new Date(Math.trunc(timestamp) * 1000)) +
         "</label></td>" +  
        "</tr>" + 
        "</table>" +
        "</div>" +
        "<div style='position:absolute; left:3px; bottom:-10px; right:3px; margin-bottom:-5px;'>" + 
            " <label style='color:white; font-family: monospace; font-size: 14px; width:100%; " + 
            " white-space: nowrap; overflow: hidden;text-overflow: ellipsis; display: inline-block;'>" +
            folder + "</label>" +
            "<div" + 
            "' style='position:absolute: left:0px; right:0px; bottom:0px; height:5px; margin-bottom:-4px; margin-left:-3px; margin-right:-3px;'><p></p></div>" +
        "</div>" +
    "</div>";

    return slide;

}

function generateSwiperEntry(html, folder, filename, timestamp) {

    return html + (filename.startsWith('status') ? generateStatusSlide(folder, timestamp) 
                                                 : generateSummarySlide(folder, timestamp));

}

function display(columns, rows) {

    showMap(columns, rows);

    window.setTimeout(() => {

      inactivateTabs();

        $('#display').css('display', 'inline-block');
        $('#structureFrame').css('display', 'inline-block');
        $('#tab1').css('text-decoration', 'underline');
        $('#tab1').addClass('active');

        showCharts(columns, rows);
        
        showGauges(columns, rows);

        console.log('completed conversion');

  }, 100);

}

function displayResults(results, callback) {
  var csv = Papa.parse(results);

  var lines = csv.data;
  var rows = [];
  var columns = null;

  for (var line in lines) {

    if (!columns) {
        columns = lines[line];
        console.log(columns);
    } else {
        rows.push(lines[line]);
    }

  }

  display(columns, rows);

  callback(columns, rows);

}

function setupDisplay() {

    $('#waitDialog').css('display', 'inline-block');
 
    var parameters = {
            folder : $('#folder').text() 
    };

    $.get('/list', parameters, function(data) {
        var html = "";
        var entries = JSON.parse(data)
        var names = [];

        for (entry in entries) {
            html = generateSwiperEntry(html, entries[entry].folder, entries[entry].file_name, entries[entry].timestamp);      
            names.push(entries[entry].folder); 
        }

        $('#swiper-wrapper').html(html);
    
        $('#swiper-container').css('visibility', 'visible');
    
        swiper = createSwipperControl();
    
        $('#swiper-container').css('visibility', 'visible');
    
        folders = [];
        $.each(names, function(i, el){
            if($.inArray(el, folders) === -1) {
                folders.push(el);
            }
        });

        $('#waitDialog').css('display', 'none');

    });

}

function refreshView(callback) {
    var parameters = {    
        folder : $('#folder').text()
    }

    var names =[];
    
    $('#waitDialog').css('display', 'inline-block');

    $.get('/list', parameters, function(data) {
        var html = "";
        var entries = JSON.parse(data)
        
        for (entry in entries) {
            html = generateSwiperEntry(html, entries[entry].folder, entries[entry].file_name, entries[entry].timestamp);
            names.push(entries[entry].folder); 
        }       
    
        $('#swiper-wrapper').html(html);
        
        swiper.update();

        $.each(names, function(i, el){
            if($.inArray(el, folders) === -1) {
                folders.push(el);
            }
        });

        callback();

        $('#waitDialog').css('display', 'none');  

    });

}

function showMission(name, timestamp) {
    var parameters = {
        name: name,
        timestamp: timestamp

    };

    $('#waitDialog').css('display', 'inline-block');

    $.get('/retrieve', parameters, function(data) {

        displayResults(data, function(columns, rows) {

        });

        $('#' + selected).css('background-color', '');
        $('#' + name + '-' + timestamp).css('background-color', 'orange');
        selected =  name + '-' + timestamp;
        $('#waitDialog').css('display', 'none');
    
    });

}

$.fn.Clear = () => {

    $('#folder').text('');

    refreshView(function() {

    });

}

$.fn.Select = (folder, index) => {

    $('#folder').text(folder);

    refreshView(function() {

    });
  
}

$(document).ready(function() {

    window.onclick = event => {

        if (document.getElementById("dropdown").classList.contains('show')) {
          document.getElementById("dropdown").classList.remove('show');
          document.getElementById("dropdown").classList.toggle("view");
        } else if (document.getElementById("dropdown").classList.contains('view')) {
          document.getElementById("dropdown").classList.remove('view');
        }
      
    }
 
    $('#folders').bind('click', (e) => {

        buildMenu(folders);

        document.getElementById("dropdown").classList.toggle("show");
        
    });

    $('#refresh').bind('click', (e) => {
        
        refreshView(function() {

        });

    });

    setupDisplay();

    var dropzone = $('#droparea');

    dropzone.on('dragover', function() {
        dropzone.addClass('hover');
        return false;
    });

    dropzone.on('dragleave', function() {
        dropzone.removeClass('hover');
        return false;
    });
    
    dropzone.on('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
        dropzone.removeClass('hover');
    
        //retrieve uploaded files data
        var files = e.originalEvent.dataTransfer.files;
        processFiles(files);
        
        return false;

    });
    
    var uploadBtn = $('#uploadbtn');
    var defaultUploadBtn = $('#upload');
    
    uploadBtn.on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        defaultUploadBtn.click();
    });

    defaultUploadBtn.on('change', function() {
        var files = $(this)[0].files;

        processFiles(files);

        return false;

    });  

    /**
     * Process uploaded files
     * 
     * @param {file[]} files an array of files
     * 
     */
    function processFiles(files) {
        var reader = new FileReader();

        reader.onload = function() {
            var arrayBuffer = reader.result;
    
            console.log(`Chunking: ${files[0].name}`);
            chunkData(files[0].name, arrayBuffer);
            
        };

        reader.readAsArrayBuffer(files[0]);
        
    }

    function chunkData(filename, video) {
        var maxChunks = Math.floor(video.byteLength / CHUNK_SIZE);

        $('#waitDialog').css('display', 'inline-block');
        $('#waitMessage').text('Chunking Data : ' + video.byteLength);
        console.log('Chunking Data : ' + video.byteLength);
        
        sendData(filename, video, maxChunks).then(function(result) {
            
            if (result.status != 'OK') {
                
                $('#waitMessage').text('');
                $('#waitDialog').css('display', 'none');
    
                return;
            }

            var guid = result.guid;

            $('#waitMessage').text(`Committing : '${filename}' - ${guid}`);

            var parameters = {filename: filename,
                            guid: guid};
    
            $.get('/commit', parameters, function(result) {
                $('#waitMessage').text('Processing : ' + filename);

                $.get('/process', parameters, function(result) {

                    retrieveAll(function(html) {   
                        $('#swiper-wrapper').html(html);
                        $('#swiper-container').css('visibility', 'visible');  
                        
                        swiper = createSwipperControl();
                        $('#waitMessage').text('');
                        $('#waitDialog').css('display', 'none');
                        $('#player').css('display', 'none');  
                        $('#placeHolder').css('display', 'inline-block');  
        
                        $('#swiper-container').css('visibility', 'visible');
                        $('#waitDialog').css('display', 'none');    
                    
                    });                  
        
                }).fail(function(code, err) {
                    alert(err); 
                    $('#waitMessage').text('');
                    $('#waitDialog').css('display', 'none');
        
                });

            }).fail(function(code, err) {
                alert(err); 
                $('#waitMessage').text('');
                $('#waitDialog').css('display', 'none');

            });

        });

    }

    /**
     * Send the Data to the Server in Chunks
     * 
     * @param {string} filename Video's Filename
     * @param {ArrayBuffer} video the Video Content
     * @param {integer} maxChunks Number of Posts to deliver the Video
     * 
     */
    async function sendData(filename, video, maxChunks) {
        var currentChunk = 0;
        var guid = '';

        console.log(`sendData: ${filename} - ${video.byteLength}`);

        for (var iChunk=0, len = video.byteLength; iChunk<len; iChunk += CHUNK_SIZE) {   
            var chunk = video.slice(iChunk, iChunk + CHUNK_SIZE); 

            console.log(`Posting: ${filename} - ${guid}`);

            var result = await postData(filename, guid, chunk, currentChunk, maxChunks);

            console.log(`Uploaded  - [${currentChunk}/${maxChunks}] + ":" + ${result.guid} - '${filename}`);

            currentChunk += 1;

            guid = result.guid;

        }

        return {
            status: 'OK',
            guid: guid
        }

    }

});