void function()
{

  Ext.overrideAT = function()
  {
  
    var toolMap = 
    {
      "help":     "Help",
      "maximize": "Edit",
      "minus":    "Clear",
      "search":   "Lookup"
    };
    
    //
    // Field Validation
    //
    
    Ext.form.Field.prototype.msgTarget = "under";
  
    //
    // Ext.form.DisplayField
    //
    
    Ext.override(Ext.form.DisplayField,
      { listeners: { 
        "afterrender": function(component) {
          if (component.user && component.user.removeLabel)
          {
            var c = component.el.dom;
            var p = c.parentElement.parentElement;
            var e = Ext.query("label[class=x-form-item-label]", p.id);
            if (e[0]) p.removeChild(e[0]); // The label may have been deleted previously for composite fields
          }
        }
      }
    });
    
    //
    // DateField
    //
    
    Ext.override(Ext.form.DateField,
      { listeners: {
        "afterrender": function(component, event) {
          var e = Ext.query("img[class*=x-form-date-trigger]", component.el.dom.parentElement.id);
          e[0].alt = "Calendar";
        }
      }
    });
    
    //
    // Ext.form.RadioGroup
    // Ext.form.CheckboxGroup
    //
    
    Ext.override(Ext.form.RadioGroup,
      { listeners: { 
        "afterrender": function(component) {
          if (component.user && component.user.removeLabel)
          {
            var c = component.el.dom;
            var p = c.parentElement.parentElement;
            var e = Ext.query("label[class=x-form-item-label]", p.id);
            p.removeChild(e[0]);
          }
        }
      }
    });
    
    Ext.override(Ext.form.CheckboxGroup,
      { listeners: { 
        "afterrender": function(component) {
          if (component.user && component.user.removeLabel)
          {
            var c = component.el.dom;
            var p = c.parentElement.parentElement;
            var e = Ext.query("label[class=x-form-item-label]", p.id);
            p.removeChild(e[0]);
          }
        }
      }
    });
    
    //
    // Ext.form.Radio
    //
    
    Ext.override(Ext.form.Radio,
      { listeners: { 
        "afterrender": function(component) {
          if (component.user && component.user.removeLabel)
          {
            var c = component.el.dom;
            var p = c.parentElement.parentElement.parentElement;
            var e = Ext.query("label[class=x-form-item-label]", p.id);
            p.removeChild(e[0]);
          }
        }
      }
    });
    
    //
    // Ext.form.Checkbox
    //
    
    Ext.override(Ext.form.Checkbox,
      { listeners: { 
        "afterrender": function(component) {
          /*
          var e = Ext.query("label[@for=" + component.el.id + "][@class*=x-form-item-label]");
          e[0].htmlFor = "";
          */
          if (component.user && component.user.removeLabel)
          {
            var c = component.el.dom;
            var p = c.parentElement.parentElement.parentElement;
            var e = Ext.query("label[class=x-form-item-label]", p.id);
            p.removeChild(e[0]);
          }
        }
      }
    });
    
    //
    // PagingToolbar
    //
    
    Ext.override(Ext.PagingToolbar,
      { listeners: {
        "afterrender": function(component) {
          Ext.each(component.items.items, function(item, index, array) {
            if (item instanceof Ext.Button)
            {
              if (item.overflowText) item.text = item.overflowText;
            }
            if (item instanceof Ext.form.TextField)
            {
              item.on("afterrender", function(component)
              {
                var c = component.el.dom;
                var p = c.parentElement;
                var e = document.createElement("label");
                e.htmlFor       = c.id;
                e.innerHTML     = "Page";
                e.style.display = "none";
                p.insertBefore(e, c);
              });
            }
          });
        }
      }
    });
    
    //
    // Ext.form.CompositeField
    //
    
    Ext.override(Ext.Toolbar,
      { listeners: {
        "afterrender": function(component) {
          
          if (component.initialConfig.user && component.initialConfig.user.showLabels)
          {
            var a = component.items.items;
            var afterrender = function(child) {
               var parent = child.el.dom.parentElement;
               var e = document.createElement("label");
               e.htmlFor       = child.el.id;
               e.innerHTML     = child.fieldLabel;
               e.style.display = "none";
               parent.insertBefore(e, child.el.dom);
             };
            
            for (var i = 0; i < a.length; i++)
            {
              var field = a[i];
              if (!field.fieldLabel) continue;
              field.on("afterrender", afterrender);
            }
          }
        }
      }
    });

    //
    // Ext.form.CompositeField
    //
    
    Ext.override(Ext.form.CompositeField,
      { listeners: {
        "afterrender": function(component) {
          
          var a = component.items.items;
          for (var i = 0; i < a.length; i++)
          {
            var child = a[i];
            if (!child.compositeLabel) continue;
            
            var parent = child.el.dom.parentElement;
            var label = document.createElement("label");
            label.htmlFor       = child.el.id;
            label.innerHTML     = child.compositeLabel;
            label.style.display = "none";
            parent.insertBefore(label, child.el.dom);
          }
          
          if (component.user && component.user.removeLabel)
          {
            var c = component.el.dom;
            var p = c.parentElement.parentElement;
            var e = Ext.query("label[class=x-form-item-label]", p.id);
            p.removeChild(e[0]);
          }
        }
      }
    });
    
    //
    // Ext.FieldSet
    //

    Ext.override(Ext.form.FieldSet,
      { listeners: {
        "afterrender": function(component) {
          if (!component.initialConfig.buttons) return;
          var tools = component.initialConfig.tools;
          var btnHandler = function(b, e) {
             b.xsave.handler(e, b, b.xpanel, null);    
          };
          
          for (var i = 0; i < tools.length; i++)
          {
            var t = tools[i];
          //console.log("handler -> ", t.handler);
            component.addButton({
              text: toolMap[t.id] || t.id,
              xsave: t,
              xpanel: component,
              handler: btnHandler
            });
          }
        }
      }
    });


    /*
    Ext.override(Ext.form.FieldSet, {
      initComponent: function()
      {
        Ext.form.FieldSet.superclass.initComponent.apply(this, arguments);
        this.addListener("afterrender", function(component) {
          if (!component.initialConfig.buttons) return;
          var tools = component.initialConfig.tools;
          for (var i = 0; i < tools.length; i++)
          {
            var t = tools[i];
          //console.log("handler -> ", t.handler);
            component.addButton({
              text: toolMap[t.id] || t.id,
              xsave: t,
              xpanel: component,
              handler: function(b, e) {
                b.xsave.handler(e, b, b.xpanel, null);    
              }
            });
          }
        });
      }
    });
    */
    
    //
    // Ext.Panel
    //

    Ext.override(Ext.Panel,
      { listeners: {
        "afterrender": function(component) {
        //console.log("Ext.Panel::afterrender");
          var e = Ext.query("img[class*=x-panel-inline-icon]", component.el.id);
          if (e[0]) e[0].alt = "Panel";
        }
      }
    });
    
    //
    // Ext.GridPanel
    //

    /*
    Ext.override(Ext.grid.GridPanel,
      { listeners: {
        "afterrender": function(component) {
        //console.log("Ext.grid.GridPanel::afterrender");
          var e = Ext.query("img[class*=x-grid3-sort-icon]", component.el.id);
          for (var i = 0; i < e.length; i++)
          {
            e[i].alt   = "Sort";            
            e[i].title = "Sort";            
          //console.log(e[i]);
          }
        }
      }
    });
    */
    Ext.override(Ext.grid.GridView, {
      
      rowOffset: 1,
      
      renderBody : function(){
        var markup = this.renderRows() || '&#160;';
        return this.templates.body.apply({ rows: markup, thead: this.renderSimpleHeaders() });
      },

      renderSimpleHeaders: function()
      {
        var colModel   = this.cm,
            properties = {},
            colCount   = colModel.getColumnCount(),
            last       = colCount - 1,
            cells      = [],
            i, cssCls;
        
        var simpleHeaderTpl = new Ext.Template('<tr>{cells}</tr>');
        var simpleCellTpl   = new Ext.Template('<th>{value}</th>');

        for (i = 0; i < colCount; i++) {
            if (i === 0) {
                cssCls = 'x-grid3-simple-first ';
            } else {
                cssCls = i == last ? 'x-grid3-simple-last ' : '';
            }
            
            if(!colModel.columns[i].hidden)
            {
               properties = {
                 id    : colModel.getColumnId(i),
                 value : colModel.getColumnHeader(i) || '',
                 style : this.getColumnStyle(i, true),
                 css   : cssCls
               };
               
               console.log(colModel);
               cells[i] = simpleCellTpl.apply(properties);
            }
        }
        
        var result = simpleHeaderTpl.apply({ cells : cells.join("") });
        
        return result;

      },
      
      rowSelector:     "tr.x-grid3-row",
      rowBodySelector: "tr.x-grid3-row-body",
      
      findRowBody: this.findRow,
      
      findRowIndex : function(el) {
        var row = this.findRow(el);
        return row ? (row.rowIndex - this.rowOffset) : false;
      },
      
      getRows : function() {
        var result = [ ];
        try
        {
          if (this.hasRows()) result = this.mainBody.dom.childNodes[0].childNodes[1].childNodes;
        }
        catch (e)
        {
        //window.alert(e);
        }
      //return this.hasRows() ? this.mainBody.dom.childNodes[0].childNodes[1].childNodes : [];
        return result;
      },
      
      hasRows : function() {
        // Add undefined/null safe check
        var dom = this.mainBody.dom;
        if (!dom.childNodes || !dom.childNodes[0] || !dom.childNodes[0].childNodes || !dom.childNodes[0].childNodes[1])
          return false;
        var fc = this.mainBody.dom.childNodes[0].childNodes[1];
        return (fc.childNodes.length > 0);
      //return fc && fc.nodeType == 1 && fc.className != 'x-grid-empty';
      },
      
      bodyTpl: new Ext.Template(
        '<table border="0" cellpadding="0" cellspacing="0" class="z-table-simple">',
          '<thead>{thead}</thead>',
          '<tbody>{rows}</tbody>',
        '</table>'
      ),
      
      cellTpl: new Ext.Template(
        '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
            '{value}',
        '</td>'
      ),

      enableRowBody: false,

      initTemplates: function()
      {
        var templates = this.templates || {},
        template, name,
        
        headerCellTpl = new Ext.Template(
            '<td class="x-grid3-hd x-grid3-cell x-grid3-td-{id} {css}" style="{style}">',
                '<div {tooltip} {attr} class="x-grid3-hd-inner x-grid3-hd-{id}" unselectable="on" style="{istyle}">', 
                    this.grid.enableHdMenu ? '<a class="x-grid3-hd-btn" href="#"></a>' : '',
                    '{value}',
                    '<img alt="Sort" class="x-grid3-sort-icon" src="', Ext.BLANK_IMAGE_URL, '" />',
                '</div>',
            '</td>'
        ),
    
        innerText = '{cells}';
    
        Ext.applyIf(templates, {
            hcell   : headerCellTpl,
            cell    : this.cellTpl,
            body    : this.bodyTpl,
            header  : this.headerTpl,
            master  : this.masterTpl,
            row     : new Ext.Template('<tr class="x-grid3-row {alt}" style="{tstyle}">' + innerText + '</tr>'),
            rowInner: new Ext.Template(innerText)
        });

        for (name in templates) {
           
          if(templates.hasOwnProperty(name))
          {
            template = templates[name];
            
            if (template && Ext.isFunction(template.compile) && !template.compiled) {
              template.disableFormats = true;
              template.compile();
            }
          }
        }

        this.templates = templates;
        this.colRe = new RegExp('x-grid3-td-([^\\s]+)', '');
      },
      
      processRows : function(startRow, skipStripe) {
        if (!this.ds || this.ds.getCount() < 1) {
            return;
        }

        var rows   = this.getRows(),
            length = rows.length,
            row, i;

        skipStripe = skipStripe || !this.grid.stripeRows;
        startRow   = startRow   || 0;

        for (i = 0; i < length; i++) {
            row = rows[i];
            if (row) {
              //row.rowIndex = i;
                if (!skipStripe) {
                    row.className = row.className.replace(this.rowClsRe, ' ');
                    if ((i + 1) % 2 === 0){
                        row.className += ' x-grid3-row-alt';
                    }
                }
            }
        }

        
        if (startRow === 0) {
            Ext.fly(rows[0]).addClass(this.firstRowCls);
        }

        Ext.fly(rows[length - 1]).addClass(this.lastRowCls);
      },
      
      updateColumnWidth : function(column, width) {
        var columnWidth = this.getColumnWidth(column),
            totalWidth  = this.getTotalWidth(),
            headerCell  = this.getHeaderCell(column),
            nodes       = this.getRows(),
            nodeCount   = nodes.length,
            row, i, firstChild;
        
        this.updateHeaderWidth();
        headerCell.style.width = columnWidth;
        
        for (i = 0; i < nodeCount; i++) {
            row = nodes[i];
            firstChild = row.firstChild;
            
            row.style.width = totalWidth;
            try
            {
              if (firstChild) {
                firstChild.style.width = totalWidth;
                firstChild.rows[0].childNodes[column].style.width = columnWidth;
              }
            }
            catch(e)
            {
            }
        }
        
        this.onColumnWidthUpdated(column, columnWidth, totalWidth);
      },
      
      refreshRow: function(record) {
        var store     = this.ds,
            colCount  = this.cm.getColumnCount(),
            columns   = this.getColumnData(),
            last      = colCount - 1,
            cls       = ['x-grid3-row'],
            rowParams = {
                tstyle: String.format("width: {0};", this.getTotalWidth())
            },
            colBuffer = [],
            cellTpl   = this.templates.cell,
            rowIndex, row, column, meta, css, i;
        
        if (Ext.isNumber(record)) {
            rowIndex = record;
            record   = store.getAt(rowIndex);
        } else {
            rowIndex = store.indexOf(record);
        }
        
        
        if (!record || rowIndex < 0) {
            return;
        }
        
        
        for (i = 0; i < colCount; i++) {
            column = columns[i];
            
            if (i === 0) {
                css = 'x-grid3-cell-first';
            } else {
                css = (i == last) ? 'x-grid3-cell-last ' : '';
            }
            
            meta = {
                id      : column.id,
                style   : column.style,
                css     : css,
                attr    : "",
                cellAttr: ""
            };
            
            meta.value = column.renderer.call(column.scope, record.data[column.name], meta, record, rowIndex, i, store);
            
            if (Ext.isEmpty(meta.value)) {
                meta.value = '&#160;';
            }
            
            if (this.markDirty && record.dirty && typeof record.modified[column.name] != 'undefined') {
                meta.css += ' x-grid3-dirty-cell';
            }
            
            colBuffer[i] = cellTpl.apply(meta);
        }
        
        row = this.getRow(rowIndex);
        row.className = '';
        
        if (this.grid.stripeRows && ((rowIndex + 1) % 2 === 0)) {
            cls.push('x-grid3-row-alt');
        }
        
        if (this.getRowClass) {
            rowParams.cols = colCount;
            cls.push(this.getRowClass(record, rowIndex, rowParams, store));
        }
        
        this.fly(row).addClass(cls).setStyle(rowParams.tstyle);
        rowParams.cells = colBuffer.join("");
        try
        {
          row.innerHTML = this.templates.rowInner.apply(rowParams);
        }
        catch (e)
        {
        }
        
        this.fireEvent('rowupdated', this, rowIndex, record);
      }

      
    });  

  };

}();

