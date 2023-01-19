({
	checkRowVisibility : function(component) {
    	var row = component.get("v.row");
        console.log('row', row);
        var showSelectedRow = component.get("v.showSelectedRows");
        var recordTypeName = component.get("v.recordTypeName");
        var el = component.find("theRow");
        console.log('recordTypeName', recordTypeName);
        console.log('showSelectedRows', showSelectedRow);
        if (showSelectedRow == true) {            
            if (row.quantity > 0) {
	            $A.util.removeClass(el, "slds-hide");
	        } else {
    	        $A.util.addClass(el, "slds-hide");            
        	}
        } else {
            let l = row.usedFor.split(';');
            var found = false;
            console.log('usedFor values', l);
            
            for(var i =0; i < l.length; i++) {
                if (l[i] == recordTypeName) {
                    found = true; break;
                } else if (recordTypeName == 'Sample Order - Storeroom Request' && (l[i] == 'Sample Order' || l[i] == 'Sample Order - E-Premise')) {
                    found = true; break;
                }
            }
            console.log('used for found for product: '+ row.productName, found);
            if (found == true) {
                $A.util.removeClass(el, "slds-hide");
            } else {
                $A.util.addClass(el, "slds-hide");
            }
        }		
	},
    getInternalOrderNumbersForBrand : function(component) {
        var row = component.get("v.row");
        var ioNumbersMap = component.get("v.internalOrderNumbersMap");
        console.log('[SampleOrderItemRow.getInternalOrderNumbersForBrand] row: ', JSON.parse(JSON.stringify(row)));
        console.log('[SampleOrderItemRow.getInternalOrderNumbersForBrand] brand: ', row.brandId);
        console.log('[SampleOrderItemRow.getInternalOrderNumbersForBrand] ioNumbersMap: ', ioNumbersMap);
        if (ioNumbersMap) {
            var ioNumbersForBrand = ioNumbersMap.get(row.brandId);
            var ioNumbers = [];
            component.set("v.internalOrderNumbers", ioNumbers);
            if (ioNumbersForBrand && ioNumbersForBrand.length > 0) {
                for(var i = 0; i < ioNumbersForBrand.length; i++) {
                    console.log('[SampleOrderItemRow.getInternalOrderNumbersForBrand] ioNumber, row.internalOrderNumber: ', ioNumbersForBrand[i], row.internalOrderNumber);
                    let ioNumber = ioNumbersForBrand[i];
                    ioNumbers.push({label: ioNumber.label, value: ioNumber.value, selected: ioNumber.value == row.internalOrderNumber});
                }
            }

            console.log('[SampleOrderItemRow.getInternalOrderNumbersForBrand] ioNumbers: ', ioNumbers);
            component.set("v.internalOrderNumbers", ioNumbers);
        }
    }
})