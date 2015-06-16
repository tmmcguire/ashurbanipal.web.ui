   
if (typeof window.console === 'undefined')
{
  window.console = { log: function() { } };
}

Ext.QuickTips.init();
Ext.form.Field.prototype.msgTarget = "side";

if (Ext.isIE)
{
  Ext.BLANK_IMAGE_URL = "/ext/docs/resources/images/default/s.gif";
}

if (!Ext.isDefined(Ext.chromeVersion))
{
  var a = navigator.userAgent.toLowerCase().match(/\bchrome\/(\d{2})\b/);
  if (a && a[1])
  {
    Ext.chromeVersion = parseInt(a[1], 10);
  }
}

Ext.grid.ColumnModel.override({
  getTotalWidth: function(includeHidden)
  {
    var offset = (Ext.chromeVersion && (Ext.chromeVersion >= 19)) ? 2 : 0;
    if (!this.totalWidth)
    {
      this.totalWidth = 0;
      for (var i = 0, len = this.config.length; i < len; i++)
      {
        if (includeHidden || !this.isHidden(i))
        {
          this.totalWidth += this.getColumnWidth(i) + offset;
        }
      }
    }
    return this.totalWidth;
  }
});

Ext.override(Ext.form.RadioGroup, {
   /**
    * Override isDirty() for current versus original value comparison at the radio group level. Ext.form.CheckboxGroup.isDirty()
    * compares Ext.form.Radio or Ext.form.Checkbox items isDirty() method. Setting Ext.form.RadioGroup.originalValue does not
    * result in expected behavior of isDirty().
    */
   isDirty : function() {
      if(this.disabled || !this.rendered) {
          return false;
      }
      
      else if(this.getValue() && !this.originalValue || !this.getValue() && this.originalValue) {
         return true;
      }
      
      else {
         return this.getValue().id !== this.originalValue.id;
      }
  },
  
  /**
   * Implementing this method in order to set a radio group value without triggering validation or firing events. Often custom event
   * handlers are associated with setting a field value. When the form is loaded and its initial values are set, it may not be desirable
   * to fire these events or perform validation.
   */
  setInitialValue: function(id, value) {
     var field, itemElements, item;
     
     if(id && value && typeof value === 'boolean') {
        field = this.getBox(id);
        
        if(field) {
           field.checked = value;
           field.el.dom.checked = field.checked;
           field.el.dom.defaultChecked = field.checked;
           
           if(field.checked === true) {
              itemElements = field.getCheckEl().select('input[name="' + field.el.dom.name + '"]');
              
              itemElements.each(function(el) {
                 if(el.dom.id !== field.id) {
                    item = Ext.getCmp(el.dom.id);
                    item.checked = false;
                    item.el.dom.checked = false;
                    item.el.dom.defaultChecked = false;
                 }
              }, field);
           }
        }        
     }     
  }
});

Ext.override(Ext.form.Field, {
   /**
    * This function sets the initial value for a field. Invoking this method will set the underlying dom element value, 
    * the field value, and the field original value with the specified argument. Validation will not be triggered. This
    * should be used on field value initialization in place of Ext.form.Field.setRawValue(). The method setRawValue()
    * does not set the field value attribute. When the method Ext.form.Field.setRawValue() is used for initialization, 
    * and the field is not currently rendered, an empty string will be returned from Ext.form.Field.getValue().
    */
   setInitialValue: function(v) {
      this.value = v;
      
      if(this.rendered) {
          this.el.dom.value = (Ext.isEmpty(v) ? '' : v);
      }
      
      return this;
   }
});

Ext.override(Ext.form.ComboBox, {
   /**
    * See Ext.form.Field.setInitialValue() for implementation details.
    * @uses Ext.form.Field.setInitialValue()
    */
   setInitialValue: function(v) {      
      var text = v;
      
      if(this.valueField) {
          var r = this.findRecord(this.valueField, v);
          
          if(r) {
              text = r.data[this.displayField];
          }
          
          else if(Ext.isDefined(this.valueNotFoundText)) {
              text = this.valueNotFoundText;
          }
      }
      
      this.lastSelectionText = text;
      
      if(this.hiddenField) {
          this.hiddenField.value = Ext.value(v, '');
      }
      
      Ext.form.ComboBox.superclass.setInitialValue.call(this, text);
      this.value = v;
      return this;
   }
});
