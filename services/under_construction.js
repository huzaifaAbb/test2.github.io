var socket = io.connect(api);


async function mainConstruction() {
    const webConstruction = await dServer.web_status();
    if(webConstruction.status == false) {
        return window.location.replace("./index.html");
    }

    socket.on('underConstruction', function (data) {
        if(data == false) {
            Alert.redirection("/index.html","Maintenance finished", "Redirecting to main website...")
        }
    });
}

mainConstruction();



