
// http://stackoverflow.com/questions/19317258/how-to-use-dijit-textarea-validation-dojo-1-9

define(["dojo/_base/declare", "dojo/_base/lang", "dijit/form/SimpleTextarea", "dijit/form/ValidationTextBox"],
function(declare, lang, SimpleTextarea, ValidationTextBox) {

  return declare( [SimpleTextarea, ValidationTextBox], {

    postMixInProperties: function(){
      this.inherited(arguments);

      // Assign validator and invalidMessage if sv is 
      var sv = sharedValidators[ this.sharedValidator ];
      if( ! this.validator && sv ) this.validator = sv;
      if( ! this.invalidMessage && sv ) this.invalidMessage = sv( false );
    },

    constructor: function(params){    	
      this.constraints = {};
      this.baseClass += ' dijitValidationTextArea';
      //this.baseClass = this.baseClass.replace('dijitTextBox', 'dijitValidationTextArea');
    },    
    templateString: "<textarea ${!nameAttrSetting} data-dojo-attach-point='focusNode,containerNode,textbox' autocomplete='off'></textarea>"
  })
})