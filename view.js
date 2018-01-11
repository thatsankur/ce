
let $ = require('jquery')
let fs = require('fs')
let filename = 'contacts'
let sno = 0
let snod = 0
var njds = require('nodejs-disks');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var sd;
var drv;
var usb = require('usb')
var usbDetect = require('usb-detection');
const drivelist = require('drivelist');
var path = require('path');



usbDetect.on('add', listDrives);
function addAttachListener() {
    usb.on('attach', function (device) {
        setTimeout(listDrives,500);
        writeOutput("Usb Attached")
        // listDrives();
        // addAttachListener();
        // addDeAttachListener();
    })
}
function addDeAttachListener() {
    usb.on('detach', function (device) {
        setTimeout(listDrives,500);
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
        //console.log(len+"=================="+id+" "+label);
        //   jQuery(id).click(function(e){
        //         alert(label);
        //         console.log("=================="+label);
        //     });
    }
}
function listDrives() {
    $('#drive-table').empty()
    drivelist.list((error, drives) => {
        if (error) {
            throw error;
        }
        console.log(drives);
        console.log("===========");

        for (i = 0; i < drives.length; i++) {
            d = drives[i];
            if (!d.isSystem) {
                addDriveEntry(d.device, "data[i].total", "data[i].freePer");
                console.log(d.device);
            }
        }
    });
}
function listDrives1() {
    $('#drive-table').empty()
    njds.drives(
        function (err, drives) {
            drv = drives
            njds.drivesDetail(
                drives,
                function (err, data) {
                    for (var i = 0; i < data.length; i++) {
                        addDriveEntry(data[i].drive, data[i].total, data[i].freePer);
                        console.log("==================");
                        /* Get drive mount point */
                        console.log("Mount Point " + data[i].mountpoint);

                        /* Get drive total space */
                        console.log("Total Space " + data[i].total);

                        /* Get drive used space */
                        console.log("Used Space " + data[i].used);

                        /* Get drive available space */
                        console.log("Available Space " + data[i].available);

                        /* Get drive name */
                        console.log("Name " + data[i].drive);

                        /* Get drive used percentage */
                        console.log("Percentage used " + data[i].usedPer);

                        /* Get drive free percentage */
                        console.log("Free Percentage " + data[i].freePer);

                        console.log("");
                        console.log("");
                    }
                }
            );
        }
    )
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
//       console.log("File Doesn\'t Exist. Creating new file.")
//       fs.writeFile(filename, '', (err) => {
//          if(err)
//             console.log(err)
//       })
//    }
// }
//DANGEROUS METHOD 
function startCloaning(source, destination) {
    //DO NOT CHANGE IT CAN DAMAGE YOUR DISK
    ls = spawn('dd', ['if=' + source, 'of=' + destination]);
    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
        $('#shell-output').text(data.toString());
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
        $('#shell-output').text(data.toString());
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code');
        $('#shell-output').text();
    });
}
function ping() {
    ls = spawn('ping', ['google.com']);

    //ls = spawn('top')
    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
        writeOutput("Output.. data ==> "+ data.toString());
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
        writeOutput("Err.. data ==> "+ data.toString());
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code');
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
function writeOutput(message){
    if(message){
         $('#shell-output').append(message+"</br>");
    }
}
// loadAndDisplayContacts()

listDrives();
addAttachListener();
addDeAttachListener();
//ping();