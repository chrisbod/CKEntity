/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Forms Plugin
 */

CKEDITOR.plugins.add( 'wallstreetdocs', {
    onLoad: function() {
        
    },
    init: function( editor ) {
            document,addEventListener("contextmenu",function (event) {
                event.stopPropagation();
            },true)
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
    },

    afterInit: function( editor ) {
    }
} );
