({
	checkRowVisibility : function(component) {
    	var row = component.get("v.row");
        console.log('[sampleOrderItemRow] row', JSON.parse(JSON.stringify(row)));
        var showSelectedRow = component.get("v.showSelectedRows");
        var recordTypeName = component.get("v.recordTypeDeveloperName");
        var el = component.find("theRow");
        console.log('[sampleorderItemRow] recordTypeName', recordTypeName);
        console.log('[sampleOrderItemRow] showSelectedRows', showSelectedRow);
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
                } else if (recordTypeName == 'Sample_Order_Storeroom_Request' && (l[i] == 'Sample_Order' || l[i] == 'Sample_Order_E-Premise')) {
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
    getInternalOrderNumbers : function(component) {
        var row = component.get("v.row");
        var ioNumbersMap = component.get("v.internalOrderNumbersMap");
        var market = component.get("v.market");
        var classification = component.get("v.classification");
        console.log('[SampleOrderItemRow.getInternalOrderNumbers] row: ', JSON.parse(JSON.stringify(row)));
        console.log('[SampleOrderItemRow.getInternalOrderNumbers] brand: ', row.brandId);
        //console.log('[SampleOrderItemRow.getInternalOrderNumbers] ioNumbersMap: ', [...ioNumbersMap.entries]);
        console.log('[SampleOrderItemRow.getInternalOrderNumbers] market: ', market);
        console.log('[SampleOrderItemRow.getInternalOrderNumbers] classification: ', classification);
        console.log('[SampleOrderItemRow.getInternalOrderNumbers] ioNumbersMap: ', ioNumbersMap);
        if (ioNumbersMap && ioNumbersMap.size > 0) {
            ioNumbersMap.forEach((val, key, map) => {
                console.log(`ioNumbersMap[${key}] = ${val}`);
            });
            let ioNumbersList;
            if (market == 'CN') {
                ioNumbersList = ioNumbersMap.get(classification);
            } else {
                ioNumbersList = ioNumbersMap.get(row.brandId);
            }
            var ioNumbers = [];
            if (ioNumbersList && ioNumbersList.length > 0) {
                for(var i = 0; i < ioNumbersList.length; i++) {
                    console.log('[SampleOrderItemRow.getInternalOrderNumbers] ioNumber, row.internalOrderNumber: ', ioNumbersList[i], row.internalOrderNumber);
                    let ioNumber = ioNumbersList[i];
                    ioNumbers.push({label: ioNumber.label, value: ioNumber.value, selected: ioNumber.value == row.internalOrderNumber});
                }
            }    

            console.log('[SampleOrderItemRow.getInternalOrderNumbers] ioNumbers: ', ioNumbers);
            component.set("v.internalOrderNumbers", ioNumbers);
        }
    }
})