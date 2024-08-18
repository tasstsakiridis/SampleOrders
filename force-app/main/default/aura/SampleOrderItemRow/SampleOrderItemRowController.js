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
        var recordTypeName = component.get("v.recordTypeDeveloperName");
        if (recordTypeName.indexOf('Storeroom_Request') >= 0) {
            recordTypeName = 'Sample_Order';
        }
        try {
            
            console.log('[SampleOrderItemRow.controller.handleBrandChange] brand', brand);
            console.log('[SampleOrderItemRow.controller.handleBrandChange] recordTypeName', recordTypeName);
            let l = row.usedFor.split(';');
            var productIsForRecordType = false;
            console.log('usedFor values', l);
            for(var i =0; i < l.length; i++) {
                if (l[i] == recordTypeName) {
                    productIsForRecordType = true; break;
                }
            }
            console.log('[SampleOrderItemRow.controller.handleBrandChange] brand, row.brandName, productIsForRecordType', brand, row.brandName, productIsForRecordType);
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
    handleCommentsChange : function(component, event, helper) {
        var row = component.get("v.row");
        row.comments = event.target.value;
        component.set("v.row", row);
    },
    handleQuantityChange : function(component, event, helper) {
        try {
            let recordType = component.get("v.recordTypeDeveloperName");            
            const captureVolumeInBottles = component.get("v.captureVolumeInBottles");
            let qty = event.target.value;
            var rowCount = component.get("v.selectedRowCount");
            var row = component.get("v.row");
            console.log('[SampleOrderItemRow.controller.handleQuantityChange] qty', qty);
            console.log('[SampleOrderItemRow.controller.handleQuantityChange] row', row);
            console.log('[SampleOrderItemRow.controller.handleQuantityChange] captureVolumeInBottles', captureVolumeInBottles);
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
                
                if (row.id != null && row.id != '') {
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
                }
            } else if (qty < 0) {
				row.quantity = 0;                   
				row.units = row.quantity * row.packQty;
                row.convertedCases = '';
                component.set("v.row", row);
                alert('Quantity out of range.  Please enter a number greater than or equal to zero');
            } else {
                console.log('recordType', '['+recordType+']');
                if (recordType == 'Sample_Order' || recordType == 'Sample_Order_UK' || recordType == 'Sample_Order_JAP') {
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
                } else if (recordType == 'Sample_Order_TWN') {
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
                } else if (recordType == 'Sample_Order_MEX') {
                    let activity = component.get("v.promotionActivity");
                    let totalActualQty = parseInt(row.totalActualQty) + parseInt(qty);
                    console.log('[SampleOrderItemRow.controller.handleQuantityChange] totalActualQty', totalActualQty);
                    console.log('[SampleOrderItemRow.controller.handleQuantityChange] totalPlanQty', row.totalPlannedQty);
                    console.log('[SampleOrderItemRow.controller.handleQuantityChange] row', row);
                    if (activity != null && activity != '' && totalActualQty > row.totalPlannedQty) {
                        alert('Total free goods given cannot be more than what was planned ['+row.totalPlannedQty + ']');
                    } else {
                        row.quantity = qty;
                        row.units = qty;
                    }
                } else if (captureVolumeInBottles) {
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
                    console.log('[SampleOrderItemRow.controller.handleQuantityChange] cases, units, convertedCases ', cases, units, row.convertedCases);
                } else {
                    row.quantity = qty;
                    row.units = qty;
                }

                console.log('[SampleOrderItemRow.controller.handleQuantityChange] row', JSON.parse(JSON.stringify(row)));
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