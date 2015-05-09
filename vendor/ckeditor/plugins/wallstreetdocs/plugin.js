/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Forms Plugin
 */

CKEDITOR.plugins.add( 'wallstreetdocs', {
    //requires: 'dialog,fakeobjects',
    // jscs:disable maximumLineLength
    //lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
    // jscs:enable maximumLineLength
    //icons: 'button,checkbox,form,hiddenfield,imagebutton,radio,select,select-rtl,textarea,textarea-rtl,textfield', // %REMOVE_LINE_CORE%
    hidpi: true, // %REMOVE_LINE_CORE%
    onLoad: function() {
        this.wsdEntities = new Entities();
    },
    init: function( editor ) {
        var entities = this.wsdEntities
            editor.addCommand("wallstreetdocs.rules", {
                    exec : function( editor )
                  {
                     alert("rules");
                  }});
             editor.addCommand("wallstreetdocs.properties", {
                    exec : function( editor )
                  {
                     alert("properties");
                  }});

           

            
           

            editor.addMenuItems({
              'wallstreetdocs.rules'  : {
                  label : "Rules",
                  command : 'wallstreetdocs.rules',
                  group : 'image',
                  order : 1
               }});
            editor.addMenuItems({
              'wallstreetdocs.properties'  : {
                  label : "Properties",
                  command : 'wallstreetdocs.properties',
                  group : 'image',
                  order : 1
               }});
                       
           // return;


        
        if ( editor.contextMenu ) {
           

            editor.contextMenu.addListener( function( element ) {
                var element = element.$;
                var entity = entities.getEntityElement(element);
                if (entity) {
                    var permissions = entities.getEditPermissions(entity);
                    var menuItems = {};
                    if (permissions.rules) {
                        menuItems['wallstreetdocs.rules'] =  CKEDITOR.TRISTATE_OFF 
                    }
                    if (permissions.properties) {
                        menuItems['wallstreetdocs.properties'] = CKEDITOR.TRISTATE_OFF;
                    }
                    return menuItems;
                }
                
            } );
        }
    },

    afterInit: function( editor ) {
    }
} );
