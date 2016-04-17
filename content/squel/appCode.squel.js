module.exports.appCode = new appCode();

function appCode()
{
    // LAUNCHED WHEN SRV FIRED EVENT
    this.code = function(req, res) {}
    // LAUNCHED ONLY ON ONE THREAD AT START
    this.runOnce = function(){}
}