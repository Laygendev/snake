/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Config = Config;

function Config(path, name)
{    
    this.path = path;
    this.name = name;
    this.value = {};
    
    this.Read = function()
    {
        try
        {
            fs.readFile(this.path, function(data)
            {
               this.value = JSON.parse(data);
            });
        }
        catch(e){}
    }
    
    this.Save = function()
    {
        fs.writeFile(this.path, JSON.stringify(this.value), 'binary', function(err){});
    }
    
}