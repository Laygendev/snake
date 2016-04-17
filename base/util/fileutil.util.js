
var fileUtil = {};

var rmdir = function(dir, cb2) 
{
	fs.readdir(dir, function(err, list)
    {
        if(err)
        {
            try
            {
                fs.unlink(dir, function(err)
                {
                    cb2(err);
                });
            }catch(e){}
        }
        else
        {
            var i = 0;
            var j = list.length;
            var cb = function(){ fs.rmdir(dir, function(err){if(cb2 && typeof cb2 == "function") cb2(err);})}
            recRm(dir, i, j, list, cb);
            return;
        }
    });
    
    function recRm(from, i, j, list, cb)
    {
        
        function nextFile()
        {
            i++;
            if(i < j)
            {
                recRm(from, i, j, list, cb)
            }
            else
            {
                if(cb && typeof cb == "function")
                    cb();
            }
        }
        try{
        var filename = path.join(from, list[i]);
        }catch(e)
        {
            nextFile();
            return;
        }
        fs.stat(filename, function(err, stat)
        {
            if(err)
            {
                nextFile();
            }
            else if(stat.isDirectory()) 
            {   
                if(filename)
                {
                    rmdir(filename, function()
                    {
                        nextFile();
                    });
                }
                else
                {
                    nextFile();
                }
            } 
            else 
            {
                fs.unlink(filename, function(err)
                {
                    nextFile();
                });
            }
        });
    }    
};

fileUtil.rmdir = rmdir;

module.exports.fileUtil = fileUtil;