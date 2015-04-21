function Entity(html,editor) {
  if (typeof html == "string") {
      this.html = html;
      this.editor = editor;
      this.id = "Entity"+Entity.counter++;
      Entity.addEntity(this);
   } else if (typeof html == "object") {
      this.html = html.innerHTML;
      this.editor = editor;
      this.id =html.getAttribute("data-entityId");

      Entity.addEntity(this)
      this.configureElement(html)
   }

}
Entity.prototype = {
   html: "",
   toElement: function () {
      var span = document.createElement("span");
      span.setAttribute("data-entityId",this.id);
      span.innerHTML = this.html;
      this.configureElement(span)
      return span;
   },
   configureElement: function (element) {
      element.contentEditable = false;
      element.className = "entity"
      element.tabIndex = -1;
   },
   handleDelete: function () {
      Entity.deleteEntity()
   }
}
Entity.entities = {};
Entity.counter = 0;
Entity.createEntity = function (html,editor) {
   return new this(html,editor)
}
Entity.addEntity = function (entity) {
   var preexisting = this.entities[entity.id];
   if (preexisting) {
      if (preexisting != entity) {
         throw new Error("Entity clash");
      }
      else {
         return entity;
      }
   }
   return this.entities[entity.id] = entity;
};
Entity.getEntityByDataId = function (id) {
   return this.entities[id]||null
}
Entity.isEntityElement = function (element) {
   if (element) {
      return element.tagName == "SPAN" && element.hasAttribute("data-entityId")
   }
   return false

}
Entity.configureEntities = function (editor) {
   var spans = editor.document.$.body.getElementsByTagName("span");
   for (var i=0,id,index;i<spans.length;i++) {
      id = spans[i].getAttribute("data-entityId")
      if (id) {
         index = parseInt((id).match(/\d+/))
         Entity.counter = Math.max(Entity.counter,index)+1
         Entity.createEntity(spans[i],editor)
      }
   }
   editor.document.$.onkeydown = function (ev) {//disables 

         if (ev && ev.keyCode == 8) {//backspace
            if (Entity.isEntityElement(ev.target)) {

            ev.preventDefault();
            var entity = Entity.getEntityByDataId(ev.target.getAttribute("data-entityId"))
            try {
            var element = new CKEDITOR.dom.element( ev.target )
            element.remove()
            
            }
            catch (e) {
               console.log("erere")
            }

         }

         }

         
   }
    editor.on("selectionChange", function (event) {
      //console.log("here")
      if (Entity.isEntityElement(event.data.path.lastElement.$)) {
         var sel = editor.getSelection();
        // console.log(sel.getStartElement())
        /* var startElement = sel.getStartElement();
         var endElement =  sel.getEndElement();
         if (startElement == endElement && Entity.isEntityElement(startElement)) {
            sel.selectElement(startElement);
         }*/ 
         
      }
      
   })
}



CKEDITOR.plugins.add( 'entity',
{   
   requires : ['richcombo'], //, 'styles' ],
   init : function( editor )
   {
      var config = editor.config,
         lang = editor.lang.format;

      // Gets the list of tags from the settings.
      var tags = []; 
      //this.add('value', 'drop_text', 'drop_label');
      tags[0]=["contact_name", "Name", "Name"];
      tags[1]=["contact_email", "email", "email"];
      tags[2]=["contact_user_name", "User name", "User name"];

//parseInt(("Eniti12").match(/\d+/))
      editor.on("instanceReady", function () {
         Entity.configureEntities(editor);

         }
      )
      

      
      
      // Create style objects for all defined styles.

      editor.ui.addRichCombo( 'entity',
         {
            label : "Entities",
            title :"Entities",
            voiceLabel : "Insert entities",
            className : 'cke_format',
            multiSelect : false,

            panel :
            {
               css : [ config.contentsCss, CKEDITOR.getUrl( 'skins/moono/editor.css' ) ],
               voiceLabel : lang.panelVoiceLabel
            },

            init : function()
            {
               this.startGroup( "entity" );
               //this.add('value', 'drop_text', 'drop_label');
               for (var this_tag in tags){
                  this.add(tags[this_tag][0], tags[this_tag][1], tags[this_tag][2]);
               }
            },

            onClick : function( value )
            {        
               var entity = new Entity(value,editor)
               editor.focus();
               editor.fire( 'saveSnapshot' );
               editor.insertElement(new CKEDITOR.dom.element(entity.toElement()));
               editor.fire( 'saveSnapshot' );
            }
         });
   }
});
