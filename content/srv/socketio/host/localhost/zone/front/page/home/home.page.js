module.exports = Home;
function Home()
{
	this.code = function(req, res)
	{
    	res.end(this.view['home']);
	}
}
