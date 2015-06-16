/*
 * ashurbanipal.web: Java Servlet-based interface to Ashurbanipal data
 * Copyright 2015 Tommy M. McGuire
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301 USA.
 */

(function() {
    "use strict";

    Ext.namespace('PG');

    // Select a book, either by selection in the search combobox, by
    // history token, or by a URL ending in '...#<etext_no>'.
    function selectBook(etext_no) {
        var selectedBook = PG.textSearchBox.getStore().getById(etext_no);
        if (selectedBook) {
            // Normal case: book's metadata is available in the
            // combobox's store.
            displaySelectedBook(selectedBook.data);
        } else {
            // Abnormal case: need to look up metadata.
            Ext.Ajax.request({
                url: 'data/file/lookup/' + etext_no,
                method: 'GET',
                success: function(response, options) {
                    displaySelectedBook( Ext.util.JSON.decode(response.responseText) );
                },
                failure: function(response, options) { /* do nothing */ },
            });
        }
    }

    // Make a request for recommendations, based on the query object
    function startRequest(query, start, limit) {
        start = typeof start !== 'undefined' ? start : 0;
        limit = typeof limit !== 'undefined' ? limit : 20;
        query.loadMask.show();
        query.transactionId = Ext.Ajax.request({
            url: query.url,
            method: 'GET',
            success: query.success,
            failure: query.failure,
            params: { etext_no: query.etext_no, start: start, limit: limit }
        });
    }

    // Complete a request for recommendations, based on a query object.
    function displayResults(query, response) {
        query.transactionId = undefined;
        query.rows = query.rows.concat( Ext.decode(response.responseText).rows );
        showResults(query);
        query.loadMask.hide();
    }

    function displayError(query, response) {
        query.transactionId = undefined;
        showResults(query, response.responseText ? response.responseText : response.statusText);
        query.loadMask.hide();
    }        

    // Given an updated query object, update the UI state to show the
    // recommendations.
    function showResults(query, message) {
        message = typeof message !== 'undefined' ? message : 'No results available';
        if (query.rows && query.rows.length) {
            // Whoohoo! Valid data!
            if (query.current === 0) {
                Ext.get(query.eltBase + '-left').hide();
            } else {
                Ext.get(query.eltBase + '-left').show();
            }
            Ext.get(query.eltBase + '-right').show();
            // Put a recommendation in an element.
            for (var i = 0; i < 3; ++i) {
                var data = query.rows[query.current + i];
                data.distance = data.score.toFixed(3) + ' ' + query.metric;
                var elt = Ext.get(query.eltBase + (i + 1));
                PG.bookTpl.overwrite(elt, data);
                elt.unmask();
            }
        } else {
            // Nope, nothing to see here.
            Ext.get(query.eltBase + '-left').hide();
            Ext.get(query.eltBase + '-right').hide();
            for (var i = 0; i < 3; ++i) {
                var elt = Ext.get(query.eltBase + (i+1));
                elt.dom.innerHTML = i === 1 ? message : '&nbsp;';
                elt.mask();
            }
        }
    }

    // Show a selected book's metadata in the Details and trigger the
    // request for recommendations.
    function displaySelectedBook(book) {
        book.distance = "";
        PG.bookTpl.overwrite(Ext.get('book-info'), book);
        PG.style.reset(book.etext_no);
        startRequest(PG.style);
        PG.topic.reset(book.etext_no);
        startRequest(PG.topic);
        PG.combination.reset(book.etext_no);
        startRequest(PG.combination);
    }

    // A recommendation's left-arrow has been clicked, display
    // lower-valued recommendations.
    function rotateLeft(query) {
        query.current -= 2;
        if (query.current < 0) { query.current = 0; }
        showResults(query);
    }

    // A recommendation's right-arrow has been clicked, display
    // higher-valued recommendations.
    function rotateRight(query) {
        query.current += 2;
        if (query.current + 3 > query.rows.length) {
            // If the current search data does not include higher elements, request more.
            startRequest(query, query.rows.length);
        } else {
            showResults(query);
        }
    }

    // Clicking on the title of a text displays the recommendation page for the text.
    function selectBookPage(event,target) {
        target = event.getTarget('.book-title', 5, true);
        if (target && target.hasClass('book-title')) {
            var etext_no = target.getAttribute('data-etext-no');
            if (etext_no) {
                Ext.History.add(etext_no);
            }
        }
    }

    // Template for displaying a book's metadata.
    PG.bookTpl = new Ext.XTemplate(
        '<div class="book-details">',
        '<p class="book-title" data-etext-no="{etext_no}"><b><i>{title},</i></b></p>',
        '<p><b>{author}</b></p>',
        '<p>{subject}</p>',
        '<tpl if="release_date"><p>Released {release_date}</p></tpl>',
        '<tpl if="loc_class"><p>Library of Congress class {loc_class}</p></tpl>',
        '<p>{language}</p>',
        '<p><em>{note}</em></p>',
        '<p>{copyright_status}</p>',
        '<p>Etext #{etext_no}</p>',
        '<p><a href="{link}" style="text-decoration:none; color:#000000;" target="_blank"><b>On to Project Gutenberg!</b></a></p>',
        '<tpl if="distance"><hr /><p>{distance}</p></tpl>',
        '</div>'
    );

    // Template used by the search combobox to display a book.
    PG.text_tmpl = new Ext.XTemplate(
        '<tpl for="."><div class="search-item">',
        '<b><i>{title}</i></b>',
        '<tpl if="author"> by <b>{author}</b> </tpl>',
        '<span style="float:right;">Etext #{etext_no}</span><br />',
        '<p style="padding-top:2px; line-height:1.2;">{subject}</p>',
        '</div></tpl>'
    );

    // Style recommendations.
    PG.style = {
        url: 'data/file/style',
        eltBase: 'style',
        metric: 'ell',
        transactionId: undefined,
        etext_no: undefined,
        rows: [],
        current: 1,

        loadMask: new Ext.LoadMask(Ext.get('style-row'), { msg: '<h3>Loading...</h3>' }),

        reset: function(etext_no) {
            PG.style.rows = [];
            PG.style.current = 1;
            PG.style.etext_no = etext_no;
        },

        // Recommendation request handlers
        success: function(response, options) { displayResults(PG.style, response); },
        failure: function(response, options) { displayError(PG.style, response); },

        // Left/right arrow handlers
        left: function(event, target) { rotateLeft(PG.style); },
        right: function(event, target) { rotateRight(PG.style); },
    };

    // Topic recommendations
    PG.topic = {
        url: 'data/file/topic',
        eltBase: 'topic',
        metric: 'bole',
        transactionId: undefined,
        etext_no: undefined,
        rows: [],
        current: 1,

        loadMask: new Ext.LoadMask(Ext.get('topic-row'), { msg: '<h3>Loading...</h3>' }),

        reset: function(etext_no) {
            PG.topic.rows = [];
            PG.topic.current = 1;
            PG.topic.etext_no = etext_no;
        },

        // Recommendation request handlers
        success: function(response, options) { displayResults(PG.topic, response); },
        failure: function(response, options) { displayError(PG.topic, response); },

        // Left/right arrow handlers
        left: function(event, target) { rotateLeft(PG.topic); },
        right: function(event, target) { rotateRight(PG.topic); },

    };

    // Combined recommendations
    PG.combination = {
        url: 'data/file/combination',
        eltBase: 'combined',
        metric: 'ell bole',
        transactionId: undefined,
        etext_no: undefined,
        rows: [],
        current: 1,

        loadMask: new Ext.LoadMask(Ext.get('combined-row'), { msg: '<h3>Loading...</h3>' }),

        reset: function(etext_no) {
            PG.combination.rows = [];
            PG.combination.current = 1;
            PG.combination.etext_no = etext_no;
        },

        // Recommendation request handlers
        success: function(response, options) { displayResults(PG.combination, response); },
        failure: function(response, options) { displayError(PG.combination, response); },

        // Left/right arrow handlers
        left: function(event, target) { rotateLeft(PG.combination); },
        right: function(event, target) { rotateRight(PG.combination); },

    };

    // ToolTip control
    PG.toolTipControl = {
        elt: Ext.get('tooltip-control'),
        enabled: false,
        disabledText: '<p>Enable Tips</p>',
        enabledText: '<p>Disable Tips</p>',
        handler: function(event, target) {
            if (PG.toolTipControl.enabled) {
                PG.toolTipControl.enabled = false;
                for (var i = 0; i < PG.toolTips.length; ++i) {
                    PG.toolTips[i].disable();
                }
                PG.toolTipControl.elt.dom.innerHTML = PG.toolTipControl.disabledText;
            } else {
                PG.toolTipControl.enabled = true;
                for (var i = 0; i < PG.toolTips.length; ++i) {
                    PG.toolTips[i].enable();
                }
                PG.toolTipControl.elt.dom.innerHTML = PG.toolTipControl.enabledText;
            }
        }
    };

    var textStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({
            url: 'data/file/lookup',
            method: 'GET',
        }),
        reader: new Ext.data.JsonReader({
            root: 'rows',
            totalProperty: 'count',
            id: 'etext_no'
        }, [
            { name: 'author' },
            { name: 'copyright_status' },
            { name: 'etext_no' },
            { name: 'language' },
            { name: 'link' },
            { name: 'loc_class' },
            { name: 'notes' },
            { name: 'release_date' },
            { name: 'subject' },
            { name: 'title' },
        ]),
    });

    PG.textSearchBox = new Ext.form.ComboBox({
        store: textStore,
        loadingText: 'Searching...',
        width: 570,
        pageSize: 20,
        hideTrigger: true,
        tpl: PG.text_tmpl,
        applyTo: 'search',
        itemSelector: 'div.search-item',
        valueField: 'etext_no',
        forceSelection: true,
        listeners: {
            'select': function(combo, record, index) {
                if (record && record.data) {
                    Ext.History.add(record.data.etext_no);
                }
            },
        },
    });

    PG.start = function() {
        var i;                  // An index variable
        
        Ext.History.init();
        // Handle this change event in order to restore the UI to the appropriate history state
        Ext.History.on('change', function(token){
            if (PG.style.transactionId) { Ext.Ajax.abort(PG.style.transactionId); }
            if (PG.topic.transactionId) { Ext.Ajax.abort(PG.topic.transactionId); }
            if (PG.combination.transactionId) { Ext.Ajax.abort(PG.combination.transactionId); }
            if (token) {
                selectBook(token);
            } else {
                PG.textSearchBox.setValue('');
            }
        });

        var clickHandlers = [
            ['style-left',      PG.style.left],
            ['style-right',     PG.style.right],
            ['topic-left',      PG.topic.left],
            ['topic-right',     PG.topic.right],
            ['combined-left',   PG.combination.left],
            ['combined-right',  PG.combination.right],
            ['app',             selectBookPage],
            ['tooltip-control', PG.toolTipControl.handler],
        ];
        for (i = 0; i < clickHandlers.length; i++) {
            Ext.get(clickHandlers[i][0]).on('click', clickHandlers[i][1]);
        }

        var token = Ext.History.getToken();
        if (token) {
            selectBook(token);
        }

        var toolTipContents = [
            {
                target: 'title',
                html: '<b>What, it\'s a title. You expect it to do something?</b>' +
                    '<p>The data is taken from the Project Gutenberg 2010 DVD, limited to those texts which are in English.</p>',
            },
            {
                target: 'book-selector',
                html: '<p><b>The idea here is to</b> select a book or other text (that\'s fancy NLP speak) that you enjoy, ' +
                    'and allow our text ferrets to identify other texts from the Project ' +
                    'Gutenberg collection that you might also like.</p> ' +
                    '<p>Type an author, title, or subject into the field, and select a text from the list. ' +
                    'Then look to the right.</p>',
            },
            {
                target: 'book-info',
                html: '<p><b>When you have selected a book on the left,</b> there, our talented and frisky ferrets look up the information ' +
                    'that Project Gutenberg has about the text (the <i>metadata</i> in NLP-talk) and displays it here.</p>' +
                    '<p>The first line is the title, followed by the author or authors. Next is (possibly missing) information about the ' +
                    'subject of the text and then the date on which the text was added to Project Gutenberg (which is admittedly not very useful). ' +
                    'Finally, the last lines are the (possibly missing) Library of Congress information, the language the text is written in ' +
                    '(English, for this set of data.), the copyright information, and the Project Gutenberg Etext number.</p> ' +
                    '<p>Below that is a link to take you to the book\'s page on Project Gutenberg, where you can download a copy of the actual ' +
                    'text, likely in several formats</p> ',
            },
            {
                target: 'style-row',
                html: '<p><b>Style recommendations are</b> a tricky subject. Currently, we are using the proportions of the various parts of speech ' +
                    'used in the text, which does not seem to be any <i>worse</i> than any other stylometric approaches. But, watch this space for ' +
                    'future improvements.</p> ' +
                    '<p>The left and right arrows scroll the list of recommendations. Right is a lower score; left is higher.</p>' +
                    '<p>By the way, clicking on the title of a book will display the recommendations for that book, and the final line of information about ' +
                    'the book is the metric used by our recommendation engine (largely for our ferrets\' amusement).</p> ',
            },
            {
                target: 'topic-row',
                html: '<p><b>Topic recommendations are</b> a bit easier than dealing with text style. The current system uses the overlap between ' +
                    'two texts\' most-frequent nouns. But, watch this space for future improvements.</p> ' +
                    '<p>The left and right arrows scroll the list of recommendations. Right is a lower score; left is higher.</p>' +
                    '<p>By the way, clicking on the title of a book will display the recommendations for that book, and the final line of information about ' +
                    'the book is the metric used by our recommendation engine (largely for our ferrets\' amusement).</p> ',
            },
            {
                target: 'combined-row',
                html: '<p><b>The overall recommendations from this system</b> a combination of style and topic scores. But, as above, watch this space for future improvements.</p> ' +
                    '<p>The left and right arrows scroll the list of recommendations. Right is a lower score; left is higher.</p>' +
                    '<p>By the way, clicking on the title of a book will display the recommendations for that book, and the final line of information about ' +
                    'the book is the metric used by our recommendation engine (largely for our ferrets\' amusement).</p> ',
            },
            {
                target: 'tooltip-control',
                html: '<p><b>Click me</b> to turn off these tips if they are getting in your way.</p>',
            }
        ];
        PG.toolTips = [];
        for (i = 0; i < toolTipContents.length; i++) {
            // Defaults
            toolTipContents[i].dismissDelay = 0;
            PG.toolTips.push( new Ext.ToolTip(toolTipContents[i]) );
        }

        PG.toolTipControl.handler(undefined, undefined);

        Ext.get('search').focus();
    };
    
}());
