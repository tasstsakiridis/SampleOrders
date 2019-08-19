({
	checkRowVisibility : function(component) {
    	var row = component.get("v.row");
        var showSelectedRow = component.get("v.showSelectedRows");
        var el = component.find("theRow");
        if (showSelectedRow == true) {            
            if (row.quantity > 0) {
	            $A.util.removeClass(el, "slds-hide");
	        } else {
    	        $A.util.addClass(el, "slds-hide");            
        	}
        } else {
            $A.util.removeClass(el, "slds-hide");
        }		
	}
})