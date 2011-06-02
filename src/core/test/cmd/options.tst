/*
    options.tst
 */

let ejs = App.exePath.portable

if (!Path("/bin").exists) {
    test.skip("Only run on unix systems")
} else {

    //  Set child directory
    cmd = new Cmd
    let parent = App.dir.parent
    cmd.start("/bin/pwd", {dir: parent})
    assert(parent.same(cmd.response.trim()))

    //  Set environment
    cmd = new Cmd
    cmd.env = { "WEATHER": "sunny", "PATH": "/bin:/usr/bin" }
    cmd.start("/bin/sh -c env")
    assert(cmd.response.contains("WEATHER=sunny"))
    assert(cmd.env.WEATHER == "sunny")
}
