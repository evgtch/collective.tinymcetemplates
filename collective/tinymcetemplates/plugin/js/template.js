tinyMCEPopup.requireLangPack();

var TemplateDialog = {
    preInit : function() {
        
        // Use this parameter to load another JavaScript file with template
        // definitions. By default, we load our own list using the semantics
        // described in the README.
        var url = tinyMCEPopup.getParam("template_external_list_url");

        if (url != null)
            document.write('<sc'+'ript language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></sc'+'ript>');
    },

    init : function() {
        var ed = tinyMCEPopup.editor, x, u, f;

        // Load templates from an explicit parameter. By default, we don't
        // use this
        var tsrc = ed.getParam("template_templates", false);
        var sel = document.getElementById('tselect');

        // Use external template list as a fallback
        if (!tsrc && typeof(tinyMCETemplateList) != 'undefined') {
            var keys = Object.keys(tinyMCETemplateList);
            for (f=0; f<keys.length; f++) {
                // Prepare new selector by cloning existing one.
                var tselect = sel.cloneNode(true);
                tselect.setAttribute('id', 'tselect_'+f);
                tselect.getElementsByTagName('select')[0].setAttribute('id', 'tpath_'+f);
                tselect.getElementsByTagName('select')[0].setAttribute('name', 'tpath_'+f);
                tselect.getElementsByTagName('label')[0].setAttribute('for', 'tpath_'+f);
                tselect.getElementsByTagName('label')[0].textContent = keys[f];

                // Add options.
                for (x=0; x < tinyMCETemplateList[keys[f]].length; x++) {
                    var title = tinyMCETemplateList[keys[f]][x][0];
                    var url = tinyMCETemplateList[keys[f]][x][1];
                    var descr = tinyMCETemplateList[keys[f]][x][2];
                    var option = new Option(title, tinyMCEPopup.editor.documentBaseURI.toAbsolute(url));
                    option.setAttribute('data-description', descr);
                    tselect.getElementsByTagName('select')[0].add(option);
                }

                // Add new selector.
                sel.parentNode.insertBefore(tselect, sel);
            }
            // Remove original selector.
            sel.remove();
        } else {
            sel = document.getElementById('tpath');
            for (x=0; x<tsrc.length; x++)
               sel.options[sel.options.length] = new Option(tsrc[x].title, tinyMCEPopup.editor.documentBaseURI.toAbsolute(tsrc[x].src));
        }

        this.resize();
    },

    resize : function() {
        var w, h, e;

        if (!self.innerWidth) {
            w = document.body.clientWidth - 50;
            h = document.body.clientHeight - 160;
        } else {
            w = self.innerWidth - 50;
            h = self.innerHeight - 170;
        }

        e = document.getElementById('templatesrc');

        if (e) {
            e.style.height = Math.abs(h - 80) + 'px';
            e.style.width  = Math.abs(w - 100) + 'px';
        }
    },

    loadCSSFiles : function(d) {
        var ed = tinyMCEPopup.editor;

        tinymce.each(ed.getParam("content_css", '').split(','), function(u) {
            d.write('<link href="' + ed.documentBaseURI.toAbsolute(u) + '" rel="stylesheet" type="text/css" />');
        });
    },

    selectTemplate : function(url, title, descr) {
        var d = window.frames['templatesrc'].document;

        if (!url)
            return;

        d.body.innerHTML = this.templateHTML = this.getFileContents(url);
        document.getElementById('tmpldesc').innerHTML = descr || '';
    },

    insert : function() {
        tinyMCEPopup.execCommand('mcePloneInsertTemplate', false, {
            content : this.templateHTML,
            selection : tinyMCEPopup.editor.selection.getContent()
        });

        tinyMCEPopup.close();
    },

    getFileContents : function(u) {
        var x, d, t = 'text/plain';

        function g(s) {
            x = 0;

            try {
                x = new ActiveXObject(s);
            } catch (s) {
            }

            return x;
        };

        x = window.ActiveXObject ? g('Msxml2.XMLHTTP') || g('Microsoft.XMLHTTP') : new XMLHttpRequest();

        // Synchronous AJAX load file
        x.overrideMimeType && x.overrideMimeType(t);
        x.open("GET", u, false);
        x.send(null);

        return x.responseText;
    }
};

TemplateDialog.preInit();
tinyMCEPopup.onInit.add(TemplateDialog.init, TemplateDialog);
