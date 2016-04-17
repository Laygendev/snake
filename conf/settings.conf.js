/*** DEBUG CONF	***/

	WF().CONF['DEBUG'] = true;

/*** SERVER CONF ***/
    WF().CONF['MAX_POST_SIZE'] = 5 * 1000 * 1000; //5MB

  /*** APP SETTINGS ***/

	WF().CONF['DEFAULT_TPL'] = "default";

	WF().CONF['CONTENT_FOLDER'] = "content/";
	WF().CONF['CONTENT_PATH'] = WF().CONF['MAIN_PATH'] + WF().CONF['CONTENT_FOLDER'];

	WF().CONF['CORE_FOLDER'] = "core/";

	WF().CONF['APP_FOLDER'] = 'app/';
	WF().CONF['APP_PATH'] = WF().CONF['CONTENT_PATH'] + WF().CONF['APP_FOLDER'];

	WF().CONF['SCRIPT_FOLDER'] = 'script/';
	WF().CONF['SCRIPT_PATH'] = WF().CONF['CONTENT_PATH'] + WF().CONF['SCRIPT_FOLDER'];

	WF().CONF['SRV_FOLDER'] = 'srv/';
	WF().CONF['SRV_PATH'] = WF().CONF['CONTENT_PATH'] + WF().CONF['SRV_FOLDER'];

	WF().CONF['HOST_FOLDER'] = "host/";

	WF().CONF['ENGINE_FOLDER'] = "engine/";
	WF().CONF['ENGINE_PATH'] = WF().CONF['CONTENT_PATH'] + WF().CONF['ENGINE_FOLDER'];

    WF().CONF['SQUEL_FOLDER'] = "squel/";
	WF().CONF['SQUEL_PATH'] = WF().CONF['CONTENT_PATH'] + WF().CONF['SQUEL_FOLDER'];

	WF().CONF['PROCESS_FOLDER'] = "process/";
	WF().CONF['PROCESS_PATH'] = WF().CONF['CONTENT_PATH'] + WF().CONF['PROCESS_FOLDER'];

	WF().CONF['VAR_FOLDER'] = "var/";
	WF().CONF['VAR_PATH'] = WF().CONF['CONTENT_PATH'] + WF().CONF['VAR_FOLDER'];

	WF().CONF['LOG_FOLDER'] = "log/";
	WF().CONF['LOG_PATH'] = WF().CONF['VAR_PATH'] + WF().CONF['LOG_FOLDER'];

    WF().CONF['TMP_FOLDER'] = "tmp/";
	WF().CONF['TMP_PATH'] = WF().CONF['CONTENT_PATH'] + WF().CONF['TMP_FOLDER'];

	WF().CONF['CONFIG_FOLDER'] = "config/";
    WF().CONF['APPCONFIG_END'] = ".json";

	WF().CONF['ZONE_FOLDER'] = "zone/";
	WF().CONF['MOD_FOLDER'] = 'mod/';
	WF().CONF['PAGE_FOLDER'] = 'page/';
	WF().CONF['TPL_FOLDER'] = 'tpl/';
	WF().CONF['PLUGIN_FOLDER'] = "plugin/";
	WF().CONF['MODEL_FOLDER'] = "model/";
    WF().CONF['JAIL_FOLDER'] = "jail/";

	/*** FILE END ***/

	WF().CONF['APP_END'] = '.app.js';
	WF().CONF['DEF_END'] = '.def.js';
	WF().CONF['CONFIG_END'] = ".conf.js";
	WF().CONF['PAGE_END'] = '.page.js';
	WF().CONF['CODE_END'] = '.code.js';
	WF().CONF['CSS_END'] = '.css.js';
	WF().CONF['MOD_END'] = '.mod.js';
	WF().CONF['TPL_END'] = '.tpl.js';
	WF().CONF['VIEW_END'] = '.html';
	WF().CONF['SCRIPT_END'] = '.script.js';
	WF().CONF['MODEL_END'] = '.model.js';
	WF().CONF['PROCESS_END'] = '.process.js';
    WF().CONF["SQUEL_END"] = ".squel.js";
	WF().CONF['OUT_END'] = '.out';
	WF().CONF['LOG_END'] = '.log';
    WF().CONF['ZIP_END'] = '.zip';

    /*** FILE NAME ***/
    WF().CONF['INSTALL_FILE'] = "install.json";

WF().CONF['SNAKE_CONF'] = {
	"networkUpdateFactor": 30,
	"maxHeartbeatInterval": 5000,

	"gameWidth": 5000,
	"gameHeight": 5000,
	"numberFood": 1000,

	"speed": 5,
	"speedAngle": 5,
	"radius": 10,

	"KEY_LEFT": 37,
	"KEY_RIGHT": 39
}
