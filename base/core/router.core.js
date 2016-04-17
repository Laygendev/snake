var ROUTER = new Router();
module.exports.Router = ROUTER;
UTILS.Router = ROUTER;
/**
 * Default "normal" router constructor.
 * accepts path, fn tuples via addRoute
 * returns {fn, param, splat, route}
 *  via Router().match
 *
 * @return {Object}
 
 EX : 
    /home* => /home + all
    /home/:id => /home with param.id = :id url, :id is needed
    /home/:id? => IDEM except that :id isn't needed
    /:controller/:action/:id.:format?
    /admin/*?
    
    "/:n.:f?" will match "/1" and "/1.json"
    "/assets/*" will match "/assets/blah/blah/blah.png" and "/assets/".
    "/assets/*.*" will match "/assets/1/2/3.js" as splat: ["1/2/3", "js"]
    regexp : /lang/:lang([a-z]{2}) will match "/lang/en" but not "/lang/12" or "/lang/eng"
    /^\/(\d{2,3}-\d{2,3}-\d{4})\.(\w*)$/ (note no quotes, this is a RegExp, not a string.) will match "/123-22-1234.json". Each match group will be an entry in splat: ["123-22-1234", "json"]
    
    TODO : ADD MULTIPLE ROUTER ?
    
 */

function Router()
{
    var localRoutes = [];
    this.routes = [];
    this.routeMap = [];
    
    this.addRoute = function(host, method, path, fn)
    {
        if (!host) return;//throw new Error(' route requires a host');
        if (!method) return;//throw new Error(' route requires a method');
        if (!path) return;//throw new Error(' route requires a path');
        if (!fn) return;//throw new Error(' route ' + path.toString() + ' requires a callback');
        
        var fPath = {host: host, method: method, url: path};
        var exist = this.match(fPath);
        if(exist)
        {
           exist.fn.push(fn);
        }
        else
        {
            var route = this.Route(host + "/" + method + path, this.routeMap.length);
            route.fn = [];
            route.fn.push(fn);
            this.routes.push(route);
            this.routeMap.push([path, [fn]]);
        }
    },
        
    this.GET = function(host, path, fn)
    {
        this.addRoute(host, "GET", path, fn)
    }
    this.POST = function(host, path, fn)
    {
        this.addRoute(host, "POST", path, fn)
    }
    this.PUT = function(host, path, fn)
    {
        this.addRoute(host, "PUT", path, fn)
    }
    this.DELETE = function(host, path, fn)
    {
        this.addRoute(host, "DELETE", path, fn)
    }
    this.ANY = function(host, path, fn)
    {
        this.addRoute(host, "*", path, fn)
    }

    // Require http req param
    this.match = function(req, startAt)
    {
      var route = this.Match(this.routes, req.host + "/" + req.method + req.url, startAt);
      if(route)
      {
        route.fn = this.routeMap[route.index][1];
      }
      return route;
    }
    
    /**
     * Convert path to route object
     *
     * A string or RegExp should be passed,
     * will return { re, src, keys} obj
     *
     * @param  {String / RegExp} path
     * @return {Object}
     */
    this.Route = function(path, index)
    {
      var src, re, keys = [];

      if(path instanceof RegExp)
      {
        re = path;
        src = path.toString();
      }
      else
      {
        re = this.pathToRegExp(path, keys);
        src = path;
      }

      return {
         re: re,
         src: path.toString(),
         keys: keys,
         index: index
      }
    };

    
    /**
     * Normalize the given path string,
     * returning a regular expression.
     *
     * An empty array should be passed,
     * which will contain the placeholder
     * key names. For example "/user/:id" will
     * then contain ["id"].
     *
     * @param  {String} path
     * @param  {Array} keys
     * @return {RegExp}
     */
    this.pathToRegExp = function (path, keys) 
    {
        path = path
            .concat('/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?|\*/g, function(_, slash, format, key, capture, optional){
                if (_ === "*"){
                    keys.push(undefined);
                    return _;
                }

                keys.push(key);
                slash = slash || '';
                return ''
                    + (optional ? '' : slash)
                    + '(?:'
                    + (optional ? slash : '')
                    + (format || '') + (capture || '([^/]+?)') + ')'
                    + (optional || '');
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/\*/g, '(.*)');
        return new RegExp('^' + path + '$', 'i');
    };
    
    
    /**
     * Attempt to match the given request to
     * one of the routes. When successful
     * a  {fn, param, splat} obj is returned
     *
     * @param  {Array} routes
     * @param  {String} uri
     * @return {Object}
     */
    this.Match = function (routes, uri, startAt) 
    {
        var captures, i = startAt || 0;

        for (var len = routes.length; i < len; ++i) 
        {
            var route = routes[i],
                re = route.re,
                keys = route.keys,
                splat = [],
                param = {};

            if (captures = uri.match(re)) 
            {
                for (var j = 1, len = captures.length; j < len; ++j) 
                {
                    var key = keys[j-1],
                        val = typeof captures[j] === 'string'
                            ? unescape(captures[j])
                            : captures[j];
                    if (key) 
                    {
                        param[key] = val;
                    } 
                    else 
                    {
                        splat.push(val);
                    }
                }
                return {
                    param: param,
                    splat: splat,
                    route: route.src,
                    index: route.index
                };
            }
        }
    };
};