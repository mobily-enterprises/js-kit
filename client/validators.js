
/* NOTE: do NOT use any of Node.js stuff here, as this will also be used by the client! */

function Validators(){
}

Validators.byName = function(type, str, emptyOk){

  if(type == 'email'){
    return Validators.email(str, emptyOk);
  }
  if(type == 'onlyLetters'){
    return Validators.onlyLetters(str, emptyOk);
  }
  if(type == 'none'){
    return Validators.none(str, emptyOk);
  }

}


Validators.none = function(str, emptyOk){
  // Check if it's empty
  if(str == '' && ! emptyOk){
   return { result: false, message: "Field cannot be empty" };
  }
  return { result: true };
}

Validators.onlyLetters = function(str, emptyOk){

  // Check if it's empty
  if(str == '' && ! emptyOk){
   return { result: false, message: "Field cannot be empty" };
  }
  return { result: true };
}

Validators.login = function(str, emptyOk){
  // Check if it's empty
  if(str == '' && ! emptyOk){
   return { result: false, message: "Login name cannot be empty" };
  }

  if(str.match(/[^a-zA-Z0-9\.]/) ){
   return { result: false, message: "Login name can only contain letters, number and '.'" };
  }
     
  return { result: true };
}


Validators.workspace = function(str, emptyOk){
  // Check if it's empty
  if(str == '' && ! emptyOk){
   return { result: false, message: "Workspace name cannot be empty" };
  }

  if(str.match(/[^a-zA-Z0-9]/) ){
   return { result: false, message: "Workspace name can only contain letters and numbers" };
  }
     
  return { result: true };
}


// http://rosskendall.com/blog/web/javascript-function-to-check-an-email-address-conforms-to-rfc822
Validators.email = function(sEmail, emptyOk){

  // Check if it's empty
  if(sEmail == '' && ! emptyOk){
   return { result: false, message: "Email cannot be empty" };
  }

  var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
  var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
  var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
  var sQuotedPair = '\\x5c[\\x00-\\x7f]';
  var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
  var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
  var sDomain_ref = sAtom;
  var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
  var sWord = '(' + sAtom + '|' + sQuotedString + ')';
  var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
  var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
  var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
  var sValidEmail = '^' + sAddrSpec + '$'; // as whole string

  var reValidEmail = new RegExp(sValidEmail);
  
  if (reValidEmail.test(sEmail)) {
    return {result: true} ;
  }
  
  return { result: false, message: "Email not valid"} ;
}



