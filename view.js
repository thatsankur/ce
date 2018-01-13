
let $ = require('jquery')
let fs = require('fs')
let filename = 'contacts'
let sno = 0
let snod = 0
//var njds = require('nodejs-disks');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var sd;
var drv;
var usb = require('usb')
var usbDetect = require('usb-detection');
const drivelist = require('drivelist');
var path = require('path');
var app = require('electron').remote;
var dialog = app.dialog;
var request = require('request');
var finalUrl
const opn = require('opn');
var {ipcRenderer, remote} = require('electron');  
var output;
usbDetect.on('add', listDrives);
function addAttachListener() {
    usb.on('attach', function (device) {
        setTimeout(listDrives, 500);
        writeOutput("Usb Attached")
        // listDrives();
        // addAttachListener();
        // addDeAttachListener();
    })
}
function addDeAttachListener() {
    usb.on('detach', function (device) {
        setTimeout(listDrives, 500);
        writeOutput("Usb Removed")
        // listDrives();
        // addDeAttachListener();
        // addAttachListener();
    })
}

// function execute(command, callback){
//     exec(command, function(error, stdout, stderr){ callback(stdout); });
// };
// $('#add-to-list').on('click', () => {
//    let name = $('#Name').val()
//    let email = $('#Email').val()

//    fs.appendFile('contacts', name + ',' + email + '\n')

//    addEntry(name, email)
// })

// function addEntry(name, email) {
//    if(name && email) {
//       sno++
//       let updateString = '<tr><td>'+ sno + '</td><td>'+ name +'</td><td>' 
//          + email +'</td></tr>'
//       $('#contact-table').append(updateString)
//    }
// }
function addDriveEntry(name, size, freeSize) {
    if (name && size && freeSize) {
        snod++
        //   len = name.split("/").length;
        //   id = name.split("/")[len-1];
        // label = snod + '::' + name + '::' + size + '::' + freeSize;
        let updateString = '<li><a href="#">' + name + '</a></li>'
        $('#drive-table').append(updateString)
        //writeOutput(len+"=================="+id+" "+label);
        //   jQuery(id).click(function(e){
        //         alert(label);
        //         writeOutput("=================="+label);
        //     });
    }
}
const df = require('@sindresorhus/df');
function listDrives() {
    $('#drive-table').empty()
    df().then(list => {

        for (i = 0; i < list.length; i++) {
            d = list[i];
            if (d.filesystem.startsWith("/dev")) {

                console.log(d.filesystem +
                    " size " + d.size / (1024 * 1024 * 1024));
                addDriveEntry(d.filesystem, d.size / (1024 * 1024 * 1024), "data[i].freePer");
                writeOutput(d.device);
            }
        }
    });
}
function listDrives2() {
    $('#drive-table').empty()
    drivelist.list((error, drives) => {
        if (error) {
            throw error;
        }
        writeOutput(drives);
        writeOutput("===========");

        for (i = 0; i < drives.length; i++) {
            d = drives[i];
            //if (!d.isSystem) {
            addDriveEntry(d.device, "data[i].total", "data[i].freePer");
            writeOutput(d.device);
            //}
        }
    });
}

// function loadAndDisplayContacts() {  

//    //Check if file exists
//    if(fs.existsSync(filename)) {
//       let data = fs.readFileSync(filename, 'utf8').split('\n')

//       data.forEach((contact, index) => {
//          let [ name, email ] = contact.split(',')
//          addEntry(name, email)
//       })

//    } else {
//       writeOutput("File Doesn\'t Exist. Creating new file.")
//       fs.writeFile(filename, '', (err) => {
//          if(err)
//             writeOutput(err)
//       })
//    }
// }

//DANGEROUS METHOD 
function startCloaning(source, destination) {
    //DO NOT CHANGE IT CAN DAMAGE YOUR DISK
    //ls = spawn('dc3dd', ['if=' + source, 'of=' + destination]);
    ls = spawn('dcfldd', ['if=' + source, 'of=' + destination]);
ipcRenderer.send('pid-message', ls.pid);
    ls.stdout.on('data', function (data) {
        writeOutput('stdout: ' + data.toString());
        //writeOutput(data.toString());
    });

    ls.stderr.on('data', function (data) {
        writeOutput('stderr: ' + data.toString());
        //writeOutput(data.toString());
    });

    ls.on('exit', function (code) {
        writeOutput('child process exited with code ' + code);
        if (code == 0) {
            $('#sa').show();
            $('#sf').show();
        }
ipcRenderer.send('pid-message-done', ls.pid);
    });
}

function startForeMostAnalysis(imagePath) {
    output = require('path').dirname(imagePath) + '/foremost-output';
    try {
        fs.mkdirSync(output)
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
    ls = spawn('foremost', ['-T', 'all', '-v', '-i', imagePath, '-o', output]);

    ls.stdout.on('data', function (data) {
        writeOutput('stdout: ' + data.toString());
        //writeOutput(data.toString());
    });

    ls.stderr.on('data', function (data) {
        writeOutput('stderr: ' + data.toString());
        //writeOutput(data.toString());
    });

    ls.on('exit', function (code) {
        writeOutput('child process exited with code ' + code);
$('#fr').show();
    });
}

function startAutopsyAnalysis(imagePath) {
    var output = require('path').dirname(imagePath) + '/foremost-output';
    try {
        fs.mkdirSync(output)
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
  var d = new Date();
    var n = d.getTime();
var caseName = 'casename_'+n;
var hostName = 'host1';
var addCaseUrl = 'http://localhost:9999/autopsy?mod=0&view=2&case='+caseName+'&desc=&inv1=&inv2=&inv3=&inv4=&inv5=&inv6=&inv7=&inv8=&inv9=&inv10=&x=97&y=13'
var addHostUrl = 'http://localhost:9999/autopsy?mod=0&view=8&case='+caseName+'&host='+hostName+'&desc=&tz=&ts=0&alert_db=&exclude_db=&x=123&y=7';
var addDiskUrl = 'http://localhost:9999/autopsy?mod=0&view=14&host='+hostName+'&case='+caseName+'&inv=unknown&img_path='+encodeURI(imagePath)+'&imgtype=volume&sort=1&x=103&y=13';
var diskAdd = 'http://localhost:9999/autopsy?mod=0&view=15&img_path='+encodeURI(imagePath)+'&num_img=1&sort=1&do_md5=1&md5=&host='+hostName+'&case='+caseName+'&inv=unknown&yes-1=1&start-1=0&end-1=0&mnt-1=%2F1%2F&ftype-1=ext&x=81&y=12';
 finalUrl = 'http://localhost:9999/'+encodeURI('autopsy?mod=1&submod=2&case='+caseName+'&host='+hostName+'&inv=unknown&vol=vol1');
createCaseHostAndAddDisk(addCaseUrl,addHostUrl,diskAdd,function() {
		writeOutput('autopsy all done \n\n== \nurl='+finalUrl);
		
		$('#ar').show();


	});




/*    ls = spawn('foremost', ['-T', 'all', '-v', '-i', imagePath, '-o', output]);

    ls.stdout.on('data', function (data) {
        writeOutput('stdout: ' + data.toString());
        //writeOutput(data.toString());
    });

    ls.stderr.on('data', function (data) {
        writeOutput('stderr: ' + data.toString());
        //writeOutput(data.toString());
    });

    ls.on('exit', function (code) {
        writeOutput('child process exited with code ' + code);
    });*/
}

function createCaseHostAndAddDisk(caseUrl,HostUrl,addDiskUrl,onDone){
request(caseUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
       	request(HostUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
 writeOutput(addDiskUrl);
request(addDiskUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
	onDone();

     }
})
     }
})
     }
})
}
function ping() {
    ls = spawn('ping', ['google.com']);

    //ls = spawn('top')
    ls.stdout.on('data', function (data) {
        writeOutput('stdout: ' + data.toString());
        writeOutput("Output.. data ==> " + data.toString());
    });

    ls.stderr.on('data', function (data) {
        writeOutput('stderr: ' + data.toString());
        writeOutput("Err.. data ==> " + data.toString());
    });

    ls.on('exit', function (code) {
        writeOutput('child process exited with code');
        writeOutput("exit");
    });
}
function getDestinationFromDrivePath(path) {
    if (path) {
        len = path.split("/").length;
        name = path.split("/")[len - 1];
        destination = name + '.fimg';
        return destination
    }
}
function writeOutput(message) {
    if (message) {
        $('#shell-output').append(message + "</br>");
        $('#shell-output').animate({ scrollTop: $('#shell-output').prop("scrollHeight") }, 500);

    }
}

function showFileSaveDialog() {
    dialog.showSaveDialog((fileName) => {
        if (fileName === undefined) {
            writeOutput("You didn't save the file");
            return;
        }
        destination = fileName;
        writeOutput('Source ' + sd + " destination file " + destination);
        $('#start').show();

    });
}

$(document).ready(function () {
    $('#sf').hide();
    $('#destination').hide();
    $('#sa').hide();
    $('#start').hide();
$('#fr').hide();
$('#ar').hide();
    $('#drive-table').on('click', 'li', function () {
        var txt = $(this).text();
        sd = txt;
        $('#destination').show();
        writeOutput(txt);
    });
    $('#destination').on('click', () => {
        if (sd) {
            showFileSaveDialog();
        }
    })
    $('#start').on('click', () => {
        if (sd) {
            source = sd;
            //destination = getDestinationFromDrivePath(sd)
            startCloaning(source, destination);
        }
    })
    $('#sf').on('click', () => {
        if (destination) {
            startForeMostAnalysis(destination);
        }
    });
    $('#sa').on('click', () => {
        if (destination) {
            startAutopsyAnalysis(destination);
        }
    })
$('#ar').on('click', () => {
writeOutput(finalUrl);
opn(finalUrl);
    })

$('#fr').on('click', () => {
writeOutput(finalUrl);
opn(output);
    })


});
// loadAndDisplayContacts()

listDrives();
addAttachListener();
addDeAttachListener();
//ping();
