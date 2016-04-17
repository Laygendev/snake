/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Header = new Header();

function Header()
{
    this.code = function(req, res)
    {
        res.setHeader('Server', 'CoreFortress/0.0.2');
        res.setHeader('X-Powered-By', 'FortressJS/0.0.2');
    }
}
