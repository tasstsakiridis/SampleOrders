({
        
    doInit : function(component) {
    },
    getDataTableColumns : function(component) {
		var action = component.get("c.getObjectDetails");
        console.log('[SampleOrder.helper.getDataTableColumns] action', action);
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrder.Helper.getObjectDetails] object', rv);
                    component.set('v.objectDescribe', rv);
                    var columns = [];
                    if (rv) {
                        //for(var f in rv.fields) {
                        //    console.log('f', rv.fields[f]);
                        //}
                        /*
                        for(var i = 0; i < rv.fields.length; i++) {
                            console.log('rv.fields[i]', rv.fields[i]);
                            //var c = { "label": rv[i].label, "fieldName":rv[i].name, "type":rv[i].type};
                            //columns.push(c);
                        }
                        */
                    }
                    component.set("v.isLoading", false);
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrder.Helper.getObjectDetails] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrder.Helper.getObjectDetails] callback returned in error.", errors);                    
                }
            }
        });
        $A.enqueueAction(action);
        	  
    },
    getMySampleOrders : function(component) {
        component.set("v.isLoading", true);
        var action = component.get("c.getSampleOrders");
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrder.Helper.getSampleOrders] orders', rv);
                    component.set('v.mySampleOrders', rv);
                    component.set("v.isLoading", false);
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrder.Helper.getSampleOrders] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrder.Helper.getSampleOrders] callback returned in error.", errors);                    
                }
            }
        });
        $A.enqueueAction(action);        
    }
})