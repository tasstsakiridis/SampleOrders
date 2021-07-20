({
	doInit : function(component, event, helper) {
        var row = component.get("v.row");
        console.log('[SampleOrderItemRow.doInit] row', row);
        console.log('[SampleOrderItemRow.doInit] product: ' + row.productName + ', qty: ' + row.quantity + ', units: ' + row.units);
        console.log('[SampleOrderItemRow.doInit] showPrice', component.get("v.showPrice"));
        console.log('[SampleOrderItemRow.doInit] showSKU', component.get("v.showSKU"));
        console.log('[SampleOrderItemRow.doInit] showIONumbers', component.get("v.showInternalOrderNumbers"));
        helper.checkRowVisibility(component);
        helper.getInternalOrderNumbersForBrand(component);
	},
    handleBrandChange : function(component, event, helper) {
    	var brand = event.getParam("value");
        var row = component.get("v.row");
        var el = component.find("theRow");
        var recordTypeName = component.get("v.recordTypeName");
        try {
            
            console.log('[SampleOrderItemRow.controller.handleBrandChange] brand', brand);
            let l = row.usedFor.split(';');
            var productIsForRecordType = false;
            console.log('usedFor values', l);
            for(var i =0; i < l.length; i++) {
                if (l[i] == recordTypeName) {
                    productIsForRecordType = true; break;
                }
            }
            
            if ((brand == '' || brand == row.brandName) && productIsForRecordType) {
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
    handleInternalOrderNumberChange : function(component, event, helper) {
        var row = component.get("v.row");
        row.internalOrderNumber = event.target.value;
        component.set("v.row", row);
        console.log('[handleInternalOrderNumberChange] row', row);
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
                row.convertedCases = '';
                component.set("v.row", row);
            } else if (qty == 0) {
                rowCount--;
                row.quantity = qty;
                row.units = 0;
                row.convertedCases = '';
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
                row.convertedCases = '';
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
                } else if (recordType == 'Sample Order - TWN') {
                    row.quantity = qty;
                    row.units = qty;
                    let cases = Math.floor(qty / row.packQty);
                    let units = qty - (cases * row.packQty);
                    var lbl_Cases = component.get("v.label_Cases");
                    var lbl_Units = component.get("v.label_Units");
                    if (cases == 0) {
                        row.convertedCases = qty + lbl_Units;
                    } else {
                        row.convertedCases = cases + ' ' + lbl_Cases + ' ' + units + ' ' + lbl_Units;
                    }
                    console.log('cases, units, convertedCases ', cases, units, row.convertedCases);

                } else {
                    row.quantity = qty;
                    row.units = qty;
                }
                console.log('row', JSON.parse(JSON.stringify(row)));
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