/*
  Copyright (C) 2016  Adrien THIERRY
  http://seraum.com 
  FortressJS site : http://fortressjs.com
*/

'use strict'

// DEFINE GLOBAL WF VAR
GLOBAL.WF = require('./start/singleton.js');

// CREATE GLOBAL WF CONF
WF().CONF = {};
WF().CONF["MAIN_PATH"] = __dirname + "/";
WF().CONF["BASE_PATH"] = WF().CONF["MAIN_PATH"] + "base" + "/";

// REQUIRE START CONF
require('./start/start.inc.js');
