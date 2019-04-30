exports.getVersion = function () {

    function mkVersion() {
        var now = new Date();
        return ("" + now.getFullYear()).slice(-2) + ("00" + (now.getMonth() + 1)).slice(-2) + ("00" + now.getDate()).slice(-2) + ("00" + now.getHours()).slice(-2) + ("00" + now.getMinutes()).slice(-2);
    }

    const version = mkVersion();

    global.version = version;

    return global.version;
}
