/*
    options.tst
 */

let ejs = App.exePath

if (!Path("/bin/echo").exists) {
    test.skip("Only run on unix systems")
} else {

    //  Set child directory
    cmd = new Cmd
    let parent = App.dir.parent
    cmd.start("/bin/pwd", {dir: parent})
    assert(cmd.response.trim() == parent)

    //  Set environment
    cmd = new Cmd
    cmd.env = { "WEATHER": "sunny" }
    cmd.start("/bin/sh -c env")
    assert(cmd.response.contains("WEATHER=sunny"))
    assert(cmd.env.WEATHER == "sunny")
}