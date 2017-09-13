/* jshint browser: true */

( function( window )
{
    "use strict";

    /*
     *  Represenets an editor
     *  @constructor
     *  @param {DOMNode} element - The TEXTAREA element to add the Wysiwyg to.
     *  @param {object} userOptions - The default options selected by the user.
     */
    function Wysiwyg( editor, userOptions ) {

        // This calls the $ function, with the element as a parameter and
        // returns the jQuery object wrapper for element. It also assigns the
        // jQuery object wrapper to the property $editor on `this`.
        var wrapper = document.createElement('div');
        var toolWrapper = document.createElement('div');
        wrapper.classList.add('seditor-wrapper');
        toolWrapper.classList.add('seditor-toolbar');

        var richer = this;
        
        this.selectedRange = null;
        var tmp = editor.cloneNode();

        editor.replaceWith(wrapper);
        this.editor = editor = tmp;
        editor.classList.add('seditor-content')

        wrapper.appendChild(toolWrapper);
        wrapper.appendChild(editor);

        this.toolWrapper = toolWrapper;
        
        var editorData = editor.dataset;
        var defaults = {
            toolbarSelector: "[data-role=editor-toolbar]",
            commandRole: "edit",
            activeToolbarClass: "btn-active",
            selectionMarker: "edit-focus-marker",
            selectionColor: "darkgrey",
            dragAndDropImages: true,
            keypressTimeout: 200,
            file: {
                error: function(reason, detail) {console.log( "File upload error", reason, detail );},
                // uploader 
                // @file File
                // @callback function(url) {}
                // uploader: function(file, callback) {}
            },
            // fileUpload: 
            widgetLabels: {font: 'Font Name', forecolor: 'Font Color', 'backcolor': 'Background Color'},
            widgetAlias: {
                font: 'fontName',
            },
            widgetDetails: {
                font: ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 
		            	'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
		            	'Times New Roman', 'Verdana'].map(function(item) {
                            return {key: item, style: 'font-family:' + item, text: item};
                        }),
                fontsize: [
                    {key: 7, style: 'font-size: xx-large', text: 'xx-large'},
                    {key: 6, style: 'font-size: x-large', text: 'x-large'},
                    {key: 5, style: 'font-size: large', text: 'large'},
                    {key: 4, style: 'font-size: medium', text: 'medium'},
                    {key: 3, style: 'font-size: small', text: 'small'},
                    {key: 2, style: 'font-size: x-small', text: 'x-small'},
                    {key: 1, style: 'font-size: xx-small', text: 'xx-small'}],
                forecolor: ['#000000', '#0000FF', '#30AD23', '#FF7F00', '#FF0000', '#FFFF00', '#FFFFFF'].map(function(color) { return {key: color, style: 'color:' + color}}),
                backcolor: ['#000000', '#0000FF', '#30AD23', '#FF7F00', '#FF0000', '#FFFF00', '#FFFFFF'].map(function(color) { return {key: color, style: 'background:' + color}})
            },
            widgetIcons: {
                font: 'text-height',
                backcolor: 'paint-brush',
                forecolor: 'font',
                insertunorderedlist: 'list-ul',
                insertorderedlist: 'list-ol',
                justifyleft: 'align-left',
                justifycenter: 'align-center',
                justifyright: 'align-right',
                justifyfull: 'align-justify',
                redo: 'repeat',
                fontsize: 'header'
            },
            widgets: [
                'font',
                'fontsize',
                'forecolor',
                'backcolor',
                [
                    'bold',
                    'italic',
                    'strikethrough',
                    'underline'
                    ],
                    [
                'insertunorderedlist',
                'insertorderedlist',
                'outdent',
                'indent'],

                ['justifyleft',
                'justifycenter',
                'justifyright',
                'justifyfull'],
                'link',
                ['unlink',
                'image'],

                ['undo',
                'redo'],

                // ['inserttext']
            ]
        };

        var options = Object.assign({}, defaults, userOptions );
        var toolbarBtnSelector = "a[data-" + options.commandRole + "],button[data-" + options.commandRole + "],input[type=button][data-" + options.commandRole + "]";
        // this.bindHotkeys( editor, options, toolbarBtnSelector );

        if ( options.dragAndDropImages ) {
            this.initFileDrops( editor, options, toolbarBtnSelector );
        }
        this.setupToolbar( toolWrapper, options );

        this.bindToolbar( editor, toolWrapper, options, toolbarBtnSelector );

        editor.setAttribute( "contenteditable", true );
        ['mouseup', 'keyup', 'mouseout'].forEach(function(event) {
            editor.addEventListener(event, (function(){
                richer.saveSelection();
                richer.updateToolbar(editor, toolbarBtnSelector, options);
            }).bind(this))
        })

        window.addEventListener( "touchend", function( e ) {
            var isInside = ( editor.is( e.target ) || editor.has( e.target ).length > 0 ),
            currentRange = this.getCurrentRange(),
            clear = currentRange && ( currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset );

            if ( !clear || isInside ) {
                richer.saveSelection();
                richer.updateToolbar( editor, toolbarBtnSelector, options );
            }
        } );
        document.querySelectorAll('.seditor-btn-group a.seditor-dropdown-toggle').forEach(function(btn){
            btn.addEventListener('click', function(e){
                e.stopPropagation()
                document.querySelectorAll('.seditor-btn-group .seditor-dropdown-menu.show').forEach(function(other){
                    if(other !== menu) {
                        other.classList.remove('show')
                    }
                })
                var menu = this.parentNode.querySelector('.seditor-dropdown-menu');
                if (menu) {
                    menu.classList.toggle('show')
                }
            }.bind(btn))
        })
        document.querySelectorAll('.seditor-btn-group .seditor-dropdown-menu').forEach(function(menu){
            menu.addEventListener('blur', function(e){
                menu.classList.remove('show')
            }.bind(menu))
        })
        document.body.addEventListener('click', function(e){
            document.querySelectorAll('.seditor-btn-group .seditor-dropdown-menu.show').forEach(function(menu){
                if (e.path.indexOf(menu) === -1) {
                    menu.classList.remove('show')
                }
            })
        })
    }    

     Wysiwyg.prototype.readFileIntoDataUrl = function( fileInfo ) {
        if (options.file.uploader && typeof options.file.uploader === 'function') {
            return Promise(function(resovle, rejected) {
                options.file.uploader(fileInfo, resovle)
            })
        } else {
            return new Promise(function(resovle, rejected){
                var fReader = new FileReader();

                fReader.onload = function( e ) {
                    resovle(e.target.result)
                // loader.resolve( e.target.result );
                };

                fReader.onerror = rejected;
                fReader.readAsDataURL( fileInfo );            
            })
        }
     };
     
     Wysiwyg.prototype.setupToolbar = function (toolbar, options) {
         var tools = '';
         var that = this;
         options.widgets.forEach(function(widget) {
             if (typeof widget === 'string') {
                tools += '<div class="seditor-btn-group">' + that.setupToolBtn(widget, options) +'</div>'
             } else {
                 tools += '<div class="seditor-btn-group">'
                widget.forEach(function(w) {
                    tools += that.setupToolBtn(w, options);
                })
                tools += '</div>';
             }
         })
         toolbar.innerHTML = tools;
     }
     Wysiwyg.prototype.setupToolBtn = function (widget, options) {
         if (widget === 'link') {
             this.hasCreateLink = true;
             return '<a class="seditor-btn seditor-btn-default seditor-dropdown-toggle" title="Hyperlink"><i class="fa fa-link"></i></a>'
					+ '<div class="seditor-dropdown-menu seditor-input-append">'
					+ '<input placeholder="URL" type="text" data-' + options.commandRole + '="createLink" />'
					+ '<button class="seditor-btn seditor-btn-createlink" type="button">Add</button>'
					+'</div>';
         } else if (widget === 'image') {
             return '<label class="seditor-btn seditor-btn-default" title="Insert picture"> <i class="fa fa-picture-o"></i>'
					+ '<input class="imgUpload" type="file" data-role="magic-overlay" data-target="#pictureBtn" data-'
                    + options.commandRole + '="insertImage" /></label>';
         }
         if (options.widgetDetails[widget]) {
            var btn = '<a class="seditor-btn seditor-btn-default seditor-dropdown-toggle" title="' 
            + widget + '"><i class="fa fa-'+ (options.widgetIcons[widget] || widget) +'"></i>'
            + '<i class="fa fa-caret-down"></i></a>';
            var li = '<ul class="seditor-dropdown-menu"><p>' 
            + (options.widgetLabels[widget] || widget) + '</p>';

            options.widgetDetails[widget].forEach(function(dt) {
                var key, text, style;
                key = text = dt;
                widget = options.widgetAlias[widget] || widget;
                if (typeof dt === 'object') {
                    key = dt.key ;
                    text = dt.text || key;
                    style = dt.style;
                }
                li += '<li><a data-' + options.commandRole + '="' + widget + ' ' + key + '" data-key="' + key + '" ';
                if (style) {
                    li += 'style="' + style + '"';
                } 
                li += '>' + text + '</a></li>';
            })
            li += '</ul>';
            return btn + li;
         } else {
            return '<a class="seditor-btn seditor-btn-default" data-' + options.commandRole + '="' + widget + '" title="' 
            + widget +'"><i class="fa fa-' + (options.widgetIcons[widget] || widget) + '"></i></a>'
         }
     }

     Wysiwyg.prototype.cleanHtml = function( o ) {
        var self = this;
        if (  self.editor.getAttribute('data-wysiwyg-html-mode' ) == true ) {
            // $( self ).html( $( self ).text( );
            self.editor.innerHTML = self.editor.textContent;
            self.editor.setAttribute('contenteditable', true)
            self.editor.setAttribute('data-wysiwyg-html-mode', false);
            // $( self ).data( "wysiwyg-html-mode", false );
        }
        var html = self.editor.innerHTML;
        self.editor.innerHTML = '';
        return html;
     };

     Wysiwyg.prototype.updateToolbar = function( editor, toolbarBtnSelector, options ) {
        if ( options.activeToolbarClass ) {
            this.toolWrapper.querySelectorAll( toolbarBtnSelector ).forEach( function(self) {
                var data = self.dataset
                var commandArr = data[ options.commandRole ].split( " " );
                var command = commandArr[ 0 ];

                // If the command has an argument and its value matches this button. == used for string/number comparison
                if ( commandArr.length > 1 && document.queryCommandEnabled( command ) && document.queryCommandValue( command ) === commandArr[ 1 ] ) {
                    self.classList.add( options.activeToolbarClass );
                }

                // Else if the command has no arguments and it is active
                else if ( commandArr.length === 1 && document.queryCommandEnabled( command ) && document.queryCommandState( command ) ) {
                    self.classList.add( options.activeToolbarClass );
                }

                // Else the command is not active
                else {
                    self.classList.remove( options.activeToolbarClass );
                }
            } );
        }
     };

     Wysiwyg.prototype.execCommand = function( commandWithArgs, valueArg, editor, options, toolbarBtnSelector ) {
        var commandArr = commandWithArgs.split( " " ),
            command = commandArr.shift(),
            args = commandArr.join( " " ) + ( valueArg || "" );

        var parts = commandWithArgs.split( "-" );

        if ( parts.length === 1 ) {
            document.execCommand( command, false, args );
        } else if ( parts[ 0 ] === "format" && parts.length === 2 ) {
            document.execCommand( "formatBlock", false, parts[ 1 ] );
        }

        // ( editor ).trigger( "change" );
        this.updateToolbar( editor, toolbarBtnSelector, options );
     };

     Wysiwyg.prototype.getCurrentRange = function() {
        var sel, range;
        if ( window.getSelection ) {
            sel = window.getSelection();
            if ( sel.getRangeAt && sel.rangeCount ) {
                range = sel.getRangeAt( 0 );
            }
        } else if ( document.selection ) {
            range = document.selection.createRange();
        }

        return range;
     };

     Wysiwyg.prototype.saveSelection = function() {
        this.selectedRange = this.getCurrentRange();
     };

     Wysiwyg.prototype.restoreSelection = function() {
        var selection;
        if ( window.getSelection || document.createRange ) {
            selection = window.getSelection();
            if ( this.selectedRange ) {
                try {
                    selection.removeAllRanges();
                }
                catch ( ex ) {
                    document.body.createTextRange().select();
                    document.selection.empty();
                }
                selection.addRange( this.selectedRange );
            }
        } else if ( document.selection && this.selectedRange ) {
            this.selectedRange.select();
        }
     };

     // Adding Toggle HTML based on the work by @jd0000, but cleaned up a little to work in this context.
     Wysiwyg.prototype.toggleHtmlEdit = function( editor ) {
        if ( editorData[ "wysiwyg-html-mode" ] != true ) {
            var oContent = editor.innnHTML;
            var editorPre = document.createElement('pre')
            editorPre.appendChild(document.createTextNode(oContent))
            editorPre.setAttribute( "contenteditable", true );
            editor.innnHTML = ' ';
            editor.appendChild(editorPre)
            editor.setAttribute( "contenteditable", false );
            editorData[ "wysiwyg-html-mode"] = true ;
            editor.focus();
        } else {
            editor.innnHTML = editor.textContent;
            editorPre.setAttribute( "contenteditable", true );
            editorData[ "wysiwyg-html-mode"] = false ;
            editor.focus();
        }
     };

     Wysiwyg.prototype.insertFiles = function( files, options, editor, toolbarBtnSelector ) {
        var self = this;
        editor.focus();
        for(var i = 0, l = files.length; i < l; i ++){
        // files.forEach(function( idx, fileInfo ) {
           (function(idx, fileInfo){
            if ( /^image\//.test( fileInfo.type ) ) {
                self.readFileIntoDataUrl( fileInfo, options ).then( function( dataUrl ) {
                    self.execCommand( "insertimage", dataUrl, editor, options, toolbarBtnSelector );
                } ).catch( function( e ) {
                    options.file.error( "file-reader", e );
                } );
            } else {
                options.file.error( "unsupported-file-type", fileInfo.type );
            }
        })(i, files[i]);
        }
     };

     Wysiwyg.prototype.markSelection = function( color, options ) {
        this.restoreSelection(  );
        if ( document.queryCommandSupported( "hiliteColor" ) ) {
            document.execCommand( "hiliteColor", false, color || "transparent" );
        }
        this.saveSelection(  );
     };

     //Move selection to a particular element
     function selectElementContents(element) {
        if (window.getSelection && document.createRange) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        } else if (document.selection && document.body.createTextRange) {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(element);
            textRange.select();
        }
    }

     Wysiwyg.prototype.bindToolbar = function( editor, toolbar, options, toolbarBtnSelector ) {
        var self = this;
        toolbar.querySelectorAll( toolbarBtnSelector ).forEach(function(btn){
            btn.addEventListener('click', function() {
                self.restoreSelection(  );
                editor.focus();

                if ( editor.dataset[ options.commandRole ] === "html" ) {
                    self.toggleHtmlEdit( editor );
                } else {
                    self.execCommand( this.dataset[( options.commandRole )], null, editor, options, toolbarBtnSelector );
                }

                self.saveSelection(  );
            }.bind(btn));
        } );

        // toolbar.querySelectorAll( "[data-toggle=dropdown]" ).on('click', (function () {
            // self.markSelection(options.selectionColor, options);
        // }));
        
        // toolbar.on( "hide.bs.dropdown", function () {
            // self.markSelection( false, options );
        // });

        ['webkitspeechchange, change'].forEach(function(event){
            toolbar.querySelectorAll( "input[type=text][data-" + options.commandRole + "]" ).forEach(function(btn){
                btn.addEventListener(event, function() {
                    var newValue = this.value;  // Ugly but prevents fake double-calls due to selection restoration
                    this.value = "";
                    self.restoreSelection(  );
                    
                    var text = window.getSelection();
                    if (text.toString().trim() === '' && newValue) {
                        //create selection if there is no selection
                        self.editor.append('<span>' + newValue + '</span>');
                        selectElementContents($('span:last', self.editor)[0]);
                    }

                    if ( newValue ) {
                        editor.focus();
                        self.execCommand( this.dataset[options.commandRole], newValue, editor, options, toolbarBtnSelector );
                    }
                    self.saveSelection( );
                }.bind(btn))
            })
        } )
       toolbar.querySelectorAll( "input[type=text][data-" + options.commandRole + "]" ).forEach(function(btn){
           btn.addEventListener('blur', function() {
            var input = $( this );
            self.markSelection( false, options );
           })
        });
        
        toolbar.querySelectorAll( "input[type=file][data-" + options.commandRole + "]" ).forEach(function(btn){
            btn.addEventListener('change', function() {
                self.restoreSelection(  );
                if ( this.type === "file" && this.files && this.files.length > 0 ) {
                    self.insertFiles( this.files, options, editor, toolbarBtnSelector );
                }
                self.saveSelection(  );
                this.value = "";
            });
        } );
        if (this.hasCreateLink) {
            toolbar.querySelectorAll( ".seditor-btn-createlink").forEach(function(btn){
            btn.addEventListener('click', function() {
                self.restoreSelection(  );
                editor.focus();
                var input = this.parentNode.querySelector('input');
                if (input && input.value && input.value.trim()){
                    if ( editor.dataset[ options.commandRole ] === "html" ) {
                        self.toggleHtmlEdit( editor );
                    } else {
                        self.execCommand( input.dataset[( options.commandRole )], input.value, editor, options, toolbarBtnSelector );
                    }
                    this.parentNode.classList.remove('show');
                }
                self.saveSelection(  );
            });
        } );     
        }
     };

     Wysiwyg.prototype.initFileDrops = function( editor, options, toolbarBtnSelector ) {
         var self = this;
         editor.addEventListener('drop', function(e) {
             var dataTransfer = e.dataTransfer;
             e.stopPropagation();
             e.preventDefault();

            if ( dataTransfer && dataTransfer.files && dataTransfer.files.length > 0 ) {
                 self.insertFiles( dataTransfer.files, options, editor, toolbarBtnSelector );
             }
         });
         ['dragenter', 'dragover'].forEach(function(event){
             editor.addEventListener(event, function(e){
                 return false;
             })
         });
     };
    window.sEditor = function(selector, options) {
        var editors =[];
        document.querySelectorAll(selector).forEach(function(el){
            editors.push(new Wysiwyg(el, options));
        });
        if (editors.length === 1) {
            editors = editors[0];
        }
        return editors;
    };
} )( window );
