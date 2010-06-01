require ejs.web

let endpoint = App.args[1]
let server: HttpServer = new HttpServer(".", "web")

var router = Router(Router.TopRoutes)
server.addListener("readable", function (event, request) {
    Web.serve(request, router)
})

server.listen(endpoint)
App.eventLoop()
