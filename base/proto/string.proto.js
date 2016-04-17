/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
  global.wfStringEndsWith = function(haystack, needle)
  {
	  return haystack.indexOf(needle, haystack.length - needle.length) !== -1;
  }
  
  global.wfStringContains = function(haystack, needle)
  {
	  return haystack.indexOf(needle) !== -1;
  }
  
