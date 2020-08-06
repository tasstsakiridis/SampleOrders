({
	doInit : function(component, event, helper) {
        var row = component.get("v.row");
        console.log('[SampleOrderItemRow.doInit] row', row);
        console.log('[SampleOrderItemRow.doInit] product: ' + row.productName + ', qty: ' + row.quantity + ', units: ' + row.units);
        console.log('[SampleOrderItemRow.doInit] showPrice', component.get("v.showPrice"));
        console.log('[SampleOrderItemRow.doInit] showSKU', component.get("v.showSKU"));
        helper.checkRowVisibility(component);
	},
    handleBrandChange : function(component, event, helper) {
    	var brand = event.getParam("value");
        var row = component.get("v.row");
        var el = component.find("theRow");
        var recordTypeName = component.get("v.recordTypeName");
        try {
            
            console.log('[SampleOrderItemRow.controller.handleBrandChange] brand', brand);
            if ((brand == '' || brand == row.brandName) && row.usedFor.indexOf(recordTypeName) >= 0) {
                $A.util.removeClass(el, "slds-hide");
            } else {
                $A.util.addClass(el, "slds-hide");
            }
        }catch(ex) {
            console.log('[SampleOrderItemRow.controller.handleBrandChange] exception', ex);
        }
    },
    handleShowSelectedRowsChange : function(component, event, helper) {
        console.log('[SampleOrderItemRow.controller.handleShowSelectedRowsChange]');
        helper.checkRowVisibility(component);
    },
        
    handleQuantityChange : function(component, event, helper) {
        try {
            let recordType = component.get("v.recordTypeName");            
            let qty = event.target.value;
            var rowCount = component.get("v.selectedRowCount");
            var row = component.get("v.row");
            console.log('[SampleOrderItemRow.controller.handleQuantityChange] qty', qty);
            if (qty == null || qty == '') {
                row.quantity = 0;
                row.units = 0;
                component.set("v.row", row);
            } else if (qty == 0) {
                rowCount--;
                row.quantity = qty;
                row.units = 0;
                component.set("v.row", row);
                
                var found = false;
                var deletedRows = component.get("v.deletedRows");
                for(var i = 0; i < deletedRows.length; i++) {
                    if (deletedRows[i].productId == row.productId) {
                        found = true; break;
                    }
                }
                console.log('[SampleOrderItemRow.controller.handleQuantityChange] deletedRows', deletedRows);
                if (!found) {
                    deletedRows.push(row);
                    component.set("v.deletedRows", deletedRows);
                }
            } else if (qty < 0) {
				row.quantity = 0;                   
				row.units = row.quantity * row.packQty;
                component.set("v.row", row);
                alert('Quantity out of range.  Please enter a number greater than or equal to zero');
            } else {
                console.log('recordType', recordType);
                if (recordType == 'Sample Order' || recordType == 'Sample Order - UK') {
                    let remainder = qty % 1;
                    console.log('remainder', remainder);
                    if (remainder > 0) {
                        alert('Please enter whole units');
                        row.quantity = 0;
                    } else {
                        row.quantity = qty;
                        rowCount++;
                    }    
                    row.units = row.quantity * row.packQty;
                } else {
                    row.quantity = qty;
                    row.units = qty;
                }
                console.log('row', row);
                component.set("v.row", row);

                var deletedRows = component.get('v.deletedRows');
                for(var i = 0; i < deletedRows.length; i++) {
                    if (deletedRows[i].productId == row.productId) {
                        deletedRows.splice(i, 1); break;
                    }
                }
            }

            component.set("v.selectedRowCount", rowCount);                
        } catch(ex) {
            console.log('[SampleOrderItemRow.controller.handleQuantityChange] exception', ex.toString());
        }
    }
    
})