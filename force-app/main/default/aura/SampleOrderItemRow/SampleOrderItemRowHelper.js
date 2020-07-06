({
	checkRowVisibility : function(component) {
    	var row = component.get("v.row");
        var showSelectedRow = component.get("v.showSelectedRows");
        var recordTypeName = component.get("v.recordTypeName");
        var el = component.find("theRow");
        if (showSelectedRow == true) {            
            if (row.quantity > 0) {
	            $A.util.removeClass(el, "slds-hide");
	        } else {
    	        $A.util.addClass(el, "slds-hide");            
        	}
        } else if (row.usedFor.indexOf(recordTypeName) < 0) {
            $A.util.addClass(el, "slds-hide");            
        } else {
            $A.util.removeClass(el, "slds-hide");
        }		
	}
})