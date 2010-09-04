/**
    Request.es -- Ejscript web request object. The Request object respresents a single HTTP request and provides
    low-level properties and methods to inspect and control the request. Request objects support the CommonJS JSGI 
    protocol specification. 
 */
module ejs.web {

    /**
        Web request class. Request objects manage the state and execution of a web request. The HttpServer class creates
        instances of Request in response to incoming client requests. The Request object holds the client request state
        including the request URL and headers. It provides low-level properties and methods to inspect and control the
        request. The Request object is a Stream and by calling the read() and write() methods, request body 
        content can be read and written.

        The response to send back to the client can be defined by setting status and calling setHeaders() and write() to 
        set the response status, headers and body content respectively.
        @spec ejs
        @stability prototype
     */
    dynamic class Request implements Stream {
        use default namespace public

        /** Security Token for use to help mitigate CSRF security threats */
        static const SecurityTokenName = "__ejs_security_token__"

        private var lastFlash: Object

        /** 
            Absolute Uri for the top-level of the application. This returns an absolute Uri (includes scheme and host) 
            for the top-most application Uri. See $home to get a relative Uri.
         */ 
        native enumerable var absHome: Uri

        /** 
            Authentication group. This property is set to the value of the authentication group header. 
            This field is read-only.
         */
        native enumerable var authGroup: String

        /** 
            Authentication method if authorization is being used (basic or digest). Set to null if not using authentication. 
            This field is read-only.
         */
        native enumerable var authType: String

        /** 
            Authentication user name. This property is set to the value of the authentication user header. Set to null if
            not yet defined.
            This field is read-only.
         */
        native enumerable var authUser: String

        /** 
            Stop auto-finalizing the request. Some web frameworks will "auto-finalize" requests by calling finalize()
            automatically at the conclusion of the request. Applications that wish to keep the connection open to the
            client can defeat this auto-finalization by calling dontAutoFinalize().

            Auto-finalization control. Set to true if the request will be finalized automatically at the conclusion of 
            the request. Defaults to true and is set to false if dontAutoFinalize() is called. 
         */
        native enumerable var autoFinalizing: Boolean

        /** 
            Request configuration. Initially refers to App.config which is filled with the aggregated "ejsrc" content.
            Middleware may modify to refer to a request local configuration object.
         */
        enumerable var config: Object

        /** 
            Associated Controller object. Set to null if no associated controller.
         */
        enumerable var controller: Controller

        /** 
            Get the request content length. This is the length of body data sent by the client with the request. 
            This property is read-only and is set to the length of the request content body in bytes or -1 if not known.
            Body data is readable by using $read() or by using the request object as a stream.
         */
        native enumerable var contentLength: Number

        /** 
            The request content type as specified by the "Content-Type" Http request header. This is set to null 
            if not defined. This is the content type of the request body content sent with the request.
         */
        native enumerable var contentType: String

        /** 
            Cookie headers. Cookies are sent by the client browser via the Set-Cookie Http header. They are typically 
            used used to specify the session state. If sessions are being used, an Ejscript session cookie will be 
            sent to and from the browser with each request. 
         */
        native enumerable var cookies: Object

        /** 
            Application web document directory on the local file system. This is set to the directory containing the
            application. For MVC applications, this is set to the base directory of the application. For non-MVC apps, 
            it is set to the directory containing the application startup script.
         */
        native enumerable var dir: Path

        /** 
            Get the encoding scheme for serializing strings. The default encoding is "utf-8".
            @hide
         */
        native var encoding: String

        /** 
            Descriptive error message for the request. This message is defined internally by the Request if a request
            times out or has a communications error.
         */
        native enumerable var errorMessage: String

        /** 
            Files uploaded as part of the request. For each uploaded file, an instance of UploadFile is created in files. 
            Each element is named by the file upload HTML input element ID in the HTML page form. 
         */
        native enumerable var files: Object

        /**
            Physical filename for the resource supplying the response content for the request. Virtual requests where
            the Request $uri does not correspond to any physical resource may not define this property.
         */
        enumerable var filename: Path

        /** 
            Notification "flash" messages to pass to the next request (only). By convention, the following keys are used:
            @option error    Negative errors (Warnings and errors)
            @option inform   Informational / postitive feedback (note)
            @option warn     Negative feedback (Warnings and errors)
            @option *        Other feedback (reminders, suggestions...)
        */
        public var flash: Object

        /** 
            Request Http headers. This is an object hash filled with lower-case request headers from the client. If multiple 
            headers of the same key value are defined, their contents will be catenated with a ", " separator as per the 
            HTTP/1.1 specification. Use the header() method if you want to retrieve a single header.
            Headers defined on the server-side by creating new header entries in $headers will preserve case. 
            Use $header() if you want to match headers using a mixed case key. e.g. header("Content-Length").
         */
        native enumerable var headers: Object

        /** 
            Home URI for the application. This is a relative Uri from the current URI to the 
            the top-most directory level of the application. 
         */ 
        native enumerable var home: Uri

        /** 
            Host serving the request. This is initialized to the authorized server hostname (HttpServer.name) if one is 
            configured.  Otherwise it will use Http "Host" header value if supplied by the client else the server IP 
            address of the accepting interface. This algorithm attempts to use the most public address available for 
            the server.
         */
        native enumerable var host: String

        /** 
            Flag indicating if the request is using secure communications. This means that TLS/SSL is the underlying
            protocol scheme.
         */
        native enumerable var isSecure: Boolean

        /**
            Resource limits for the request. The limits have initial default values defined by the owning HttpServer.
            @param limits. Limits is an object hash with the following properties:
            @option chunk Maximum size of a chunk when using chunked transfer encoding.
            @option inactivityTimeout Maximum time in seconds to keep a connection open if idle. Set to zero for no timeout.
            @option receive Maximum size of incoming body data.
            @option requestTimeout Maximum time in seconds for a request to complete. Set to zero for no timeout.
            @option reuse Maximum number of times to reuse a connection for requests (KeepAlive count).
            @option sessionTimeout Maximum time to preserve session state. Set to zero for no timeout.
            @option transmission Maximum size of outgoing body data.
            @option upload Maximum size of uploaded files.
            @see setLimits
          */
        native enumerable var limits: Object

        /** 
            Server IP address of the accepting interface
         */
        native enumerable var localAddress: String

        /** 
            Logger object. Set to App.log. This is configured from the "log" section of the "ejsrc" config file.
         */
        native var log: Logger 

        /** 
            Request HTTP method. String containing the Http method (DELETE | GET | POST | PUT | OPTIONS | TRACE)
         */
        native enumerable var method: String

        /** 
            Original HTTP request method used by the client. If the method is overridden by including a "-ejs-method-" 
            parameter in a POST request or by defining an X-HTTP-METHOD-OVERRIDE Http header, the original method used by
            the client is stored in this property and the method property reflects the newly defined value.
         */
        enumerable var originalMethod: String

        /**
            The original request URI supplied by the client. This is the Uri path supplied by the client on the first
            line of the Http request. It is combined with the HttpServer scheme, host and port components to yield a 
            fully qualified URI. The "uri" property has fields for: scheme, host, port, path, query and reference.
            The "uri" property is read-only.
         */
        native enumerable var originalUri: Uri

        /** 
            The request form parameters. This parameters are www-url decoded from the POST request body data. 
         */
        native enumerable var params: Object

        /** 
            Portion of the request URL after the scriptName. This is the location of the request within the application.
            The pathInfo is originally derrived from uri.path after splitting off the scriptName. Changes to the uri or 
            scriptName properties will not affect the pathInfo property.
         */
        native enumerable var pathInfo: String

        /** 
            TCP/IP port number for the server of this request.
         */
        native enumerable var port: Number

        /** 
            Http request protocol (HTTP/1.0 | HTTP/1.1)
         */
        native enumerable var protocol: String

        /** 
            Request query string. This is the portion of the Uri after the "?". Set to null if there is no query.
         */
        native enumerable var query: String

        /** 
            Request reference string. This is the portion of the Uri after the "#". Set to null if there is no reference.
         */
        native enumerable var reference: String

        /** 
            Name of the referring URL. This comes from the request "Referrer" Http header. Set to null if there is
            no defined referrer.
         */
        native enumerable var referrer: String

        /** 
            IP address of the client issuing the request. 
         */
        native enumerable var remoteAddress: String

        /**
            The application has responded in some way. The application has commenced a response by doing some 
            output or setting status.
         */
        native var responded: Boolean

        /** 
            Http response headers. This is the proposed set of headers to send with the response.
            The case of header keys is preserved.
         */
        native enumerable var responseHeaders: Object

        /** 
            Route used for the request. The route is the matching entry in the route table for the request.
            The route has properties two properties of particular interest: "name" which is the name of the route and
            and "type" which classifies the type of request. 
         */
        enumerable var route: Route

        /** 
            Http request scheme (http | https)
         */
        native enumerable var scheme: String

        /** 
            Script name for the current application serving the request. This is typically the leading Uri portion 
            corresponding to the application, but middleware may modify this to be an arbitrary string representing 
            the application.  The script name is often determined by the Router as it parses the request using 
            the routing tables. The scriptName will be set to the empty string if not defined, otherwise is should begin
            with a "/" character. NOTE: changing script name will not update home or absHome.
         */
        native enumerable var scriptName: String

        /** 
            Owning server for the request. This is the HttpServer object that created this request.
         */
        native enumerable var server: HttpServer

        /** 
            Session state object. The session state object can be used to share state between requests.
            If a session has not already been created, accessing this property automatically creates a new session 
            and sets the $sessionID property and a cookie containing a session ID sent to the client with the response.
            To test if a session has been created, test the sessionID property which will not auto-create a session.
            Objects are stored in the session state using JSON serialization.
         */
        native var session: Session 

        /** 
            Current session ID. Index into the $sessions object. Set to null if no session is defined.
         */
        native enumerable var sessionID: String

        /** 
            Set to the (proposed) Http response status code.
         */
        native enumerable var status: Number

        /**
            The current request URI. This property is read-only and is dynamically computed from the originalUri combined
            with the current scheme, host, port, scriptName, pathInfo, query and reference property values. 
            The "uri" property has fields for: scheme, host, port, path, query and reference.
         */
        native enumerable var uri: Uri

        /*************************************** Methods ******************************************/
        /*
            Construct the a Request object. Request objects are typically created by HttpServers and not constructed
            manually.
            @param uri Request URI
            @param dir Default directory containing web documents
         */
        function Request(uri: Uri, dir: Path = ".") {
            this.uri = uri
            this.dir = dir
        }

        /** 
            @duplicate Stream.async
            Request does not support sync mode and only supports async mode.
         */
        native function get async(): Boolean
        native function set async(enable: Boolean): Void

        /** 
            Finalize the request if dontAutoFinalize has not been called. Finalization signals the end of any write data 
            and flushes any buffered write data to the client. This routine is used by frameworks to allow users to 
            defeat finalization by calling dontAutoFinalize. Users can then call finalize() to explictly control when
            all the response data has been written. If dontAutoFinalize() has been called, this call will have no effect. 
            In that case, call finalize() to finalize the request.
         */
        native function autoFinalize(): Void 

        /** 
            @duplicate Stream.close
            This closes the current request by finalizing all transmission data and sending a "close" event. It may 
            not actually close the socket connection if the reuse limit has not been exceeded (see limits).
            It is normally not necessary to explicitly call close a request as the web framework will automatically 
            close finalized requests when all input data has fully been read. Calling close on an already closed
            request is silently ignored. 
         */
        native function close(): Void

        function checkSecurityToken() {
            if (session[SecurityTokenName] && session[SecurityTokenName] != params[SecurityTokenName]) {
                throw "Security token does not match. Potential CSRF attack. Denying request"
            }
        }

        /**
            Create a session state object. The session state object can be used to share state between requests.
            If a session has not already been created, this call will create a new session and initialize the 
            $session property with the new session. It will also set the $sessionID property and a cookie containing 
            a session ID will be sent to the client with the response. Sessions can also be used/created by simply
            accessing the session property.  Objects are stored in the session state using JSON serialization.
            @param timeout Optional session state timeout in seconds. Set to zero for no timeout. After the timeout has 
                expired, the session will be deleted. 
         */
        function createSession(timeout: Number = -1): Session {
            if (timeout >= 0) {
                setLimits({ sessionTimeout: timeout })
            }
            return session
        }

        /**
            Stop auto-finalizing the request. Some web frameworks will "auto-finalize" requests by calling finalize()
            automatically at the conclusion of the request. Applications that wish to keep the connection open to the
            client can defeat this auto-finalization by calling dontAutoFinalize().
         */
        native function dontAutoFinalize(): Void

        /** 
            Destroy a session. This call destroys the session state store that is being used for the current client. 
            If no session exists, this call has no effect. Sessions are created by reading or writing to the $session 
            property.
         */
        native function destroySession(): Void

        /** 
            Set an error flash notification message.
            Flash messages persist for only one request and are a convenient way to pass state information or 
            feedback messages to the next request. To use flash messages, setupFlash() and finalizeFlash() must 
            be called before and after the request is processed. Web.process will call setupFlash and finalizeFlash 
            automatically.
            @param msg Message to store
         */
        function error(msg: String): Void
            notify("error", msg)

        /** 
            The request pathInfo file extension
         */
        function get extension(): String
            Uri(pathInfo).extension

        /** 
            Signals the end of any and all response data and flushes any buffered write data to the client. 
            If the request has already been finalized, this call has no additional effect.
         */
        native function finalize(): Void 

        /** 
            Has the request output been finalized. 
            @return True if the all the output has been written.
         */
        native function get finalized(): Boolean 

        /* 
            Save flash messages for the next request and delete old flash messages.
         */
        function finalizeFlash() {
            if (flash) {
                if (lastFlash) {
                    for (item in flash) {
                        for each (old in lastFlash) {
                            if (hashcode(flash[item]) == hashcode(old)) {
                                delete flash[item]
                            }
                        }
                    }
                }
                if (Object.getOwnPropertyCount(flash) > 0) {
                    session["__flash__"] = flash
                }
            }
        }

        /** 
            Flush request data. Calling flush(Sream.WRITE) or finalize() is required to ensure buffered write data is sent 
            to the client. Flushing the read direction is ignored.
            @duplicate Stream.flush
         */
        native function flush(dir: Number = Stream.WRITE): Void

        /** 
            Get a request header by keyword. Headers supplied by the remote client are stored in lower-case. 
            Headers defined on the server-side preserve case. This routine supports both by doing a case-insensitive lookup.
            @param key Header key value to retrieve. The key match is case insensitive.
            @return The header value
         */
        native function header(key: String): String

        /** 
            Set a informational flash notification message.
            Flash messages persist for only one request and are a convenient way to pass state information or 
            feedback messages to the next request. To use flash messages, setupFlash() and finalizeFlash() must 
            be called before and after the request is processed. Web.process will call setupFlash and finalizeFlash 
            automatically.
            @param msg Message to store
         */
        function inform(msg: String): Void
            notify("inform", msg)

        /** 
            Create a link to a URI. The target parameter may contain partial or complete URI information. The missing 
            parts are supplied using the current request URI and route tables.  The resulting URI is a normalized, 
            server-local URI (begins with "/"). The URI will include any defined scriptName but will not include scheme, 
            host or port components.
            @params target The target parameter can be a URI string or object hash of components. If the target is a
               string, it is may contain an absolute or relative URI. If the target has an absolute URI path, that path
               is used unmodified. If the target is a relative URI, it is appended to the current request URI path. 
               The target argument can also be an object hash of URI components: path, query, reference, controller, 
               action and other route table tokens. 
               If the target is a string begins with "@" it has the form "@[Controller.]action". This is a shorthand
               way to specify an action and optional controller.
            @option path String URI path portion
            @option query String URI query parameters. Does not include "?"
            @option reference String URI path reference. Does not include "#"
            @option controller String Controller name if using a Controller-based route
            @option action String Action name if using a Controller-based route
            @option other String Other route table tokens
            @example
                Given a current request of http://example.com/samples/demo" and "r" == the current request:

                r.link("images/splash.png")                  returns "/samples/images/splash.png"
                r.link("images/splash.png").complete(r.uri)  returns "http://example.com/samples/images/splash.png"
                r.link("images/splash.png").relative(r.uri)  returns "images/splash.png"

                r.link({action: "checkout")
                r.link({controller: "User", action: "logout")
                r.link("@User.logout")
                r.link({uri: "http://example.com/checkout"})

                r.link({action: "checkout")
                r.link("@checkout")

            @return A normalized, server-local Uri object.
         */
        function link(target: Object): Uri {
            let result
            if (target[0] == "@") {
                target = target.slice(1)
                if (target.contains(/[\.\/]/)) {
                    let [resource, route] = target.split(/[\.\/]/)
                    target = {resource: resource, route: route}
                } else { 
                    target = {route: target}
                }
            }
            if (route && Object.getOwnPropertyCount(target) > 0 && !target.uri) {
                target = route.completeLink(target, this)
            }
print("RESULT " + target)
//  MOB -- should links be script name relative
            let result = uri.local.resolve(target).normalize
            return result
        }

        /*
            Select the response content type based on the request "Accept" header . See RFC-2616.
            @param formats Array of supported mime types
            @return The selected mime type string

            Accept: "application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png"
         */
        function matchContent(...formats): String {
            let accept = header("Accept")
            if (accept) {
                let media = accept.split(",")
                for (let [i, m] in media) {
                    let [mime, quality] = m.split(";")
                    quality = (quality || "q=1").trimStart("q=") cast Number
                    media[i] = { mime: mime, quality: quality || 1}
                }
                media = media.sort(function(a, i, j) {
                    if (a[i].quality < a[j].quality) {
                        return -1
                    } else if (a[i].quality > a[j].quality) {
                        return 1
                    } else {
                        return 0
                    }
                }, -1)
                for each (m in media) {
                    if (m.mime.contains("*")) {
                        let pat = RegExp(m.mime.replace(/\*/g, ".*"))
                        for each (f in formats) {
                            if (f.match(pat)) {
                                return f
                            }
                        }
                    } else if (formats.contains(m.mime)) {
                        return m.mime
                    }
                }
            }
            return formats[0]
        }

        /** 
            Set a transient flash notification message. Flash messages persist for only one request and are a convenient
                way to pass state information or feedback messages to the next request. To use flash messages, 
                setupFlash() and finalizeFlash() must be called before and after the request is processed. Web.process
                will call setupFlash and finalizeFlash automatically.
            @param key Flash message key
            @param msg Message to store
         */
        function notify(key: String, msg: String): Void {
            if (!flash) {
                createSession()
                flash = {}
            }
            flash[key] = msg
        }

        /** 
            @duplicate Stream.observe
            @event readable Issued when some body content is available.
            @event writable Issued when the connection is writable to accept body data (PUT, POST).
            @event close Issued when the request completes
            @event error Issued if the request does not complete or the connection disconnects. An error event is not 
                caused by non-200 status codes, these are regarded as valid return results. Rather, an error event will
                be issued when the request cannot return a complete, valid Http response to the client.
            All events are called with the signature:
            function (event: String, http: Http): Void
         */
        native function observe(name, observer: Function): Void

        /** 
            @duplicate Stream.read
            If the request is posting a form, i.e. the Http ContentType header is set to 
            "application/x-www-form-urlencoded", then the request object will not be created by the HttpServer until
            all the form data is read and the $params collection is populated with the form data. This permits form
            data to be processed synchronously without having to use async/observer techniques to respond to readable
            events. With all other content types, the Request object will be created and run, before incoming client 
            data has been read. To read data in these situations, register an observer function to run when the
            connection becomes "readable".
            @example:
                request.observe("readable", function(event, request) {
                    var data = new byteArray
                    if (read(data)) {
                        print("Got " + data)
                    } else {
                        //  End of input
                        request.finalize()
                    }
                })
         */
        native function read(buffer: ByteArray, offset: Number = 0, count: Number = -1): Number 

        /** 
            Redirect the client to a new URL. This call redirects the client's browser to a new target specified 
            by the $url.  Optionally, a redirection code may be provided. Normally this code is set to be the HTTP 
            code 302 which means a temporary redirect. A 301, permanent redirect code may be explicitly set.
            @param target Uri to redirect the client toward. This can be a relative or absolute string URI or it can be
                a hash of URI components. For example, the following are valid inputs: "../index.ejs", 
                "http://www.example.com/home.html", {action: "list"}.
            @param status Optional HTTP redirection status
         */
        function redirect(target: *, status: Number = Http.MovedTemporarily): Void {
            this.status = status
            target = link(target).complete(uri)
            setHeader("Location", target)
            write("<!DOCTYPE html>\r\n" +
                   "<html><head><title>Redirect (" + status + ")</title></head>\r\n" +
                    "<body><h1>Redirect (" + status + ")</h1>\r\n" + 
                    "<p>The document has moved <a href=\"" + target + 
                    "\">here</a>.</p>\r\n" +
                    "<address>" + server.software + " at " + host + " Port " + server.port + 
                    "</address></body>\r\n</html>\r\n")
            //  MOB -- want to allow templates to call redirect and may write more blank linkes -- finalize()
        }

        /** 
            @duplicate Stream.removeObserver 
         */
        native function removeObserver(name, observer: Function): Void

        /**
            Get a security token to help mitigate CSRF threats. The security token is submitted by forms and requests and
            can be validated by controllers. The token is stored in session["__ejs-security-token__"]. 
         */
        function get securityToken(): Object {
            session[SecurityTokenName] ||= md5(Math.random()) 
            return session[SecurityTokenName]
        }

        /** 
            Define a cookie header to send with the response. Path, domain and lifetime can be set to null for 
                default values.
            @param name Cookie name
            @param options Cookie field options
            @options value Cookie value
            @options path Uri path to which the cookie applies
            @options domain String Domain in which the cookie applies. Must have 2-3 "." and begin with a leading ".". 
                For example: domain: .example.com
            @options expires Date When the cookie expires
            @options secure Boolean Set to true if the cookie only applies for SSL based connections
         */
        function setCookie(name: String, options: Object) {
            options.path ||= "/"
            let cookie = Uri.encodeComponent(name) + "=" + options.value
            cookie += "; path=" + options.path
            if (options.domain)
                cookie += "; domain=" + options.domain
            if (options.expires)
                cookie += "; expires= " + options.expires.toUTCString()
            if (options.secure)
                cookie += "; secure"
            setHeader("Set-Cookie", cookie)
            setHeader("Cache-control", "no-cache=\"set-cookie\"")
        }

        /** 
            Convenience routine to set a Http response header in $responseHeaders. If a header has already been 
            defined and $overwrite is true, the header will be overwritten. NOTE: case is ignored in the header keyword.
            Access $responseHeaders to inspect the proposed response header set.
            @param key The header keyword for the request, e.g. "accept".
            @param value The value to associate with the header, e.g. "yes"
            @param overwrite If the header is already defined and overwrite is true, then the new value will
                overwrite the old. If overwrite is false, the new value will be catenated to the old value with a ", "
                separator.
         */
        native function setHeader(key: String, value: String, overwrite: Boolean = true): Void

        /**
            Convenience routine to set multiple Http response headers in $responseHeaders. Access $responseHeaders to 
            inspect the proposed response header set.
            @param headers Set of headers to use
            @param overwrite If the header is already defined and overwrite is true, then the new value will
                overwrite the old. If overwrite is false, the new value will be catenated to the old value with a ", "
                separator.
         */
        function setHeaders(headers: Object, overwrite: Boolean = true): Void {
            for (let [key,value] in headers) {
                setHeader(key, value, overwrite)
            }
        }

        /**
            Update the request resource limits. The supplied limit fields are updated.
            See the $limits property for limit field details.
            @param limits Object hash of limit fields and values
            @see limits
         */
        native function setLimits(limits: Object): Void

        /**
            Convenience routine to define an application at a given Uri prefix and directory location. This is typically
                called from routing tables.
            @param prefix The leading Uri prefix for the application. This prefix is removed from the pathInfo and the
                $scriptName property is set to the prefix. The script name should begin with "/".
            @param location Path to where the application home directory is. This sets the $dir property to the $location
                argument.
        */
        function setLocation(prefix: String, location: Path): Void {
            prefix = prefix.trimEnd("/")
            pathInfo = pathInfo.trimStart(prefix)
            scriptName = prefix
            dir = location
        }

        /** 
            Convenience routine to set the (proposed) Http response status code. This is equivalent to assigning 
            to the $status property.
         */
        function setStatus(status: Number): Void
            this.status = status

        /* 
            Prepare the flash message area. This copies flash messages from the session state store into the flash store.
         */
        function setupFlash() {
            if (sessionID) {
                lastFlash = null
                flash = session["__flash__"]
                if (flash) {
                    session["__flash__"] = undefined
                    lastFlash = flash.clone()
                } else {
                    flash = null
                }
            }
        }

        /** 
            Dump objects for debugging
            @param args List of arguments to print.
            @hide
         */
        function show(...args): Void {
            for each (var e: Object in args) {
                write(serialize(e, {pretty: true}) + "\r\n")
            }
        }

        /** 
            Create a top-level URI link. A top-level URI has an absolute path and is useful to ensure a link always
            refers to the same resource even when a HTML fragment may be rendered from pages different URLs. 
            The target parameter may contain partial or complete URI information. The missing parts are supplied 
            using the current request URI and route tables.  The resulting URI is a top-level normalized, server-local URI. 
            It will not include scheme, host or port components. The path will always beging with "/". NOTE: the 
            result will include the current $scriptName.
            @params target The target parameter can be a URI string or object hash of components. If the target is a
               string, it is may be an absolute or relative URI. If the target has an absolute URI path, that path
               it be used unmodified. If the target is a relative URI, it is appended to the current request URI path. 
               The target argument can also be an object hash of URI components: path, query, reference, controller, 
               action and other route table tokens. 
            @option path String URI path portion
            @option query String URI query parameters. Does not include "?"
            @option reference String URI path reference. Does not include "#"
            @option controller String Controller name if using a Controller-based route
            @option action String Action name if using a Controller-based route
            @option other String Other route table tokens
            @example
                Given a current request of http://example.com/samples/demo", where scriptName is "samples" and 
                "r" == the current request:

                r.toplink("images/splash.png")   returns "/samples/images/splash.png"
                r.toplink("/images/splash.png")  returns "/samples/images/splash.png"

            @return A normalized, server-local Uri object.
         */
//  MOB -- should this be topLink
        function toplink(target: *): Uri {
            if (target is String) {
                if (target[0] == "@") {
                    if (target.contains(".")) {
                        let [resource, route] = target.split(".")
                        target = {resource: resource, route: route}
                    } else { 
                        target = {route: target}
                    }
                } else if (target[0] == '/') {
                    target = Uri(target.substring(1)).normalize
                }
            }
            if (route && Object.getOwnPropertyCount(target) > 0 && !target.uri) {
                target = route.completeLink(target, this)
            } 
            return absHome.local.resolve(target).normalize
        }

        /**
            Configure tracing for this request. Tracing is initialized by the owning HttpServer and is typically
            defined to trace the first line of requests and responses at level 2, headers at level 3 and body content
            at level 4. Once the request has been created however, the first line and headers of the request are 
            already parsed and traced by the HttpServer, so modifying the trace level via trace() on the request object
            will only impact the tracing of response body content.
            
            The options argument contains optional properties: rx and tx 
            (for receive and transmit tracing). The rx and tx properties may contain an object hash which describes 
            the tracing for that direction and includes any of the following fields:
            @param options. Set of trace options with properties "rx" and "tx" for receive and transmit direction tracing.
                The include property is an array of file extensions to include in tracing.
                The include property is an array of file extensions to exclude from tracing.
                The all property specifies that everything for this direction should be traced.
                The conn property specifies that new connections should be traced.
                The first property specifies that the first line of the request should be traced.
                The headers property specifies that the headers (including first line) of the request should be traced.
                The body property specifies that the body content of the request should be traced.
                The size property specifies a maximum body size in bytes that will be traced. Content beyond this limit 
                    will not be traced.
            @option transmit. Object hash with optional properties: include, exclude, first, headers, body, size.
            @option receive. Object hash with optional properties: include, exclude, conn, first, headers, body, size.
            @example:
                trace({
                    transmit: { exclude: ["gif", "png"], "headers": 3, "body": 4, size: 1000000 }
                    receive:  { "conn": 1, "headers": 2 , "body": 4, size: 1024 }
                })
          */
        native function trace(options: Object): Void

        /** 
            Set a warning flash notification.
            Flash messages persist for only one request and are a convenient way to pass state information or 
            feedback messages to the next request. To use flash messages, setupFlash() and finalizeFlash() must 
            be called before and after the request is processed. Web.process will call setupFlash and finalizeFlash 
            automatically.
            @param msg Message to store
         */
        function warn(msg: String): Void
            notify("warn", msg)

        /** 
            Write data to the client. This will buffer the written data until either flush() or finalize() is called. 
            @duplicate Stream.write
         */
        native function write(...data): Number

        /** 
            Write a block of data to the client. This will buffer the written data which will be flushed when either 
            close(), flush() or finalize() is called or the underlying pipeline is full. 
            @param buffer Destination byte array for read data.
            @param offset Offset in the byte array from which to write. If the offset is -1, then data is
                written from the buffer read $position which is then updated. 
            @param count Read up to this number of bytes. If -1, write all available data in the buffer. 
            @returns a count of the bytes actually written. Returns null on eof.
            @event writable Issued when the connection can absorb more data.

            MOB - same for Http and other streams
         */
        # FUTURE
        native function writeBlock(buffer: ByteArray, offset: Number = 0, count: Number = -1): Number 

        /**
            Write content based on the requested accept mime type
            @param data
         */
        function writeContent(data): Void {
            let mime = matchContent("application/json", "text/html", "application/xml", "text/plain")
            setHeader("Content-Type", mime)
            switch (mime) {
            case "application/json":
                write(serialize(data, {pretty: true}) + "\n")
                break
            case "application/xml":
                write("XML\n")
                break
            case "text/html":
                if (controller) {
                    controller.writeView("edit")
                } else {
                    write("HTML\n")
                }
                break
            default:
            case "text/plain":
                write("PLAIN " + serialize(data, {pretty: true}) + "\n")
                break
            }
        }

        /** 
            Write an error message back to the user and finalize the request.  The output is Html escaped for security.
            @param status Http status code
            @param msgs Messages to send with the response. The messages may be modified for readability if it 
                contains an exception backtrace.
         */
        function writeError(status: Number, ...msgs): Void {
            this.status = status
            let msg = msgs.join(" ").replace(/.*Error Exception: /, "")
            let title = "Request Error for \"" + pathInfo + "\""
            let text
            if (config.log.showClient) {
                text = "<pre>" + escapeHtml(msg) + "</pre>\r\n" +
                    '<p>To prevent errors being displayed in the "browser, ' + 
                    'set <b>log.showClient</b> to false in the ejsrc file.</p>\r\n'
                try {
                    setHeader("Content-Type", "text/html")
                    write(errorBody(title, text))
                } catch {}
            }
            finalize()
            //  MOB -- what level should this be?
            //  Can't be zero else it comes out in utest
            log.debug(1, "Request error (" + status + ") for: \"" + uri + "\". " + msg)
        }

        /**
            Send a static file back to the client. This is a high performance way to send static content to the client.
            This call must be invoked prior to sending any data or headers to the client, otherwise it will be ignored
            and the slower netConnector will be used instead.
            @param file Path to the file to send back to the client
            @return True if the Send connector can successfully be used. 
         */
        native function writeFile(file: Path): Boolean

        //  MOB
        function sendFile(file: Path): Boolean
            writeFile(file)

        /** 
            Send a response to the client. This can be used instead of setting status and calling setHeaders() and write(). 
            The $response argument is an object hash containing status, headers and
            body properties. The respond method replaces previously defined status and headers.
            @option status Numeric Http status code (e.g. 200 for a successful response)
            @option header Object hash of Http headers
            @option body Body content
        */
        function writeResponse(response: Object): Void {
            status = response.status || 200
            if (response.headers)
                setHeaders(response.headers)
            if (response.body)
                write(response.body)
            autoFinalize()
        }

        //  MOB
        function sendResponse(response: Object): Void
            writeResponse(response)

        /** 
            Write safely. Write HTML escaped data back to the client.
            @param args Objects to HTML encode and write back to the client.
         */
        function writeSafe(...args): Void
            write(html(...args))

        /**
            The number of bytes written to the client. This is the count of bytes passed to $write and buffered, 
            not the actual number of bytes sent to the network connection.
            @return
         */
        native function get written(): Number

        /********************************************** JSGI  ********************************************************/
        /** 
            JSGI specification configuration object.
            @spec jsgi-0.3
         */
        static var jsgi: Object = {
            errors: App.log,
            version: [0,3],
            multithread: true,
            multiprocess: false,
            runonce: false,
        }

        /** 
            Storage for middleware specific state. Added for JSGI compliance.
            @spec jsgi-0.3
         */
        native enumerable var env: Object

        /**
            Request content stream. This is equivalent to using "this" as Request objects are streams connected to the
            input content. Added for JSGI compliance.
            @spec jsgi-0.3
            @returns Stream object equal to the value of "this" request instance.
        */
        function get input(): Stream
            this

        /** 
            Decoded query string (URL query string). Eqivalent to the $query property. Added for JSGI compliance
            @spec jsgi-0.3
            @return A string containing the request query. Returns an empty string if there is no query.
         */
        function get queryString(): String
            query

        /**
            Listening port number for the server
            @returns A number set to the TCP/IP port for the listening socket.
         */
        function get serverPort(): Number
            server.port


        /**
            @example
            @option max-age Max time in seconds the resource is considered fresh
            @option s-maxage Max time in seconds the resource is considered fresh from a shared cache
            @option public marks authenticated responses as cacheable
            @option private shared caches may not store the response
            @option no-cache cache must re-submit request for validation before using cached copy
            @option no-store response may not be stored in a cache.
            @option must-revalidate forces caches to observe expiry and other freshness information
            @option proxy-revalidate similar to must-revalidate except only for proxy caches
          */
        function cache(options) {
        }


        /*************************************** Deprecated ***************************************/

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get accept(): String
            header("accept")

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get acceptCharset(): String
            header("accept-charset")

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get acceptEncoding(): String
            header("accept-encoding")

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get authAcl(): String {
            throw new Error("Not supported")
            return null
        }

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get body(): String {
            let data = new ByteArray
            while (read(data));
            return data
        }

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get connection(): String
            header("connection")

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get hostName(): String
            host

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get mimeType(): String
            header("content-type")

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get pathTranslated(): String
            dir.join(pathInfo)

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get pragma(): String
            header("pragma")

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get remoteHost(): String
            header("host")

        /** 
            @hide
            @deprecated 2.0.0
          */
        # Config.Legacy
        function get url(): String
            pathInfo

        /** 
            Get the name of the client browser software set in the "User-Agent" Http header 
            @hide
            @deprecated 2.0.0
         */
        # Config.Legacy
        function get userAgent(): String
            header("user-agent")

        /** 
            @hide
            @deprecated 2.0.0
         */
        # Config.Legacy
        function writeHtml(...args): Void
            writeSafe(...args)
    }
}

/*
    @copy   default
    
    Copyright (c) Embedthis Software LLC, 2003-2010. All Rights Reserved.
    Copyright (c) Michael O'Brien, 1993-2010. All Rights Reserved.
    
    This software is distributed under commercial and open source licenses.
    You may use the GPL open source license described below or you may acquire 
    a commercial license from Embedthis Software. You agree to be fully bound 
    by the terms of either license. Consult the LICENSE.TXT distributed with 
    this software for full details.
    
    This software is open source; you can redistribute it and/or modify it 
    under the terms of the GNU General Public License as published by the 
    Free Software Foundation; either version 2 of the License, or (at your 
    option) any later version. See the GNU General Public License for more 
    details at: http://www.embedthis.com/downloads/gplLicense.html
    
    This program is distributed WITHOUT ANY WARRANTY; without even the 
    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
    
    This GPL license does NOT permit incorporating this software into 
    proprietary programs. If you are unable to comply with the GPL, you must
    acquire a commercial license to use this software. Commercial licenses 
    for this software and support services are available from Embedthis 
    Software at http://www.embedthis.com 

    @end
 */
