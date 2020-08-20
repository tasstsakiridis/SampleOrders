({
        
    doInit : function(component) {
        this.getUserDetails(component);
    },

    getUserDetails : function(component) {
        console.log('[SampleOrder.helper.getUserDetails]');
        var action = component.get("c.getCurrentUserInfo");
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrder.Helper.getUserDetails] user', rv);
                    component.set('v.userId', rv.id);
                    component.set('v.userName', rv.name);
                    component.set("v.marketId", rv.value);
                    component.set('v.marketName', rv.description);
                    console.log('[SampleOrder.helper.getUserDetails] marketName', rv.description);
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrder.Helper.getUserDetails] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrder.Helper.getUserDetails] callback returned in error.", errors);                    
                }
            }
        });
        $A.enqueueAction(action);
    },
    getDataTableColumns : function(component) {
        console.log('[SampleOrder.helper.getDataTableColumns]');
		var action = component.get("c.getObjectDetails");
        action.setCallback(this, function(response) {
            console.log('[SampleOrder.helper.getDataTableColums] component valid', component.isValid());
            if (component.isValid()) {
                var callState = response.getState();
                console.log('[SampleOrder.helper.getDataTableColumns] callstate', callState);
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrder.Helper.getDataTableColumns] object', rv);
                    component.set('v.objectDescribe', rv);
                    console.log('[SampleOrder.helper.getDataTableColumns] recordtypes: ', rv.recordTypes);
                    var recordTypes = [];
                    try {
                    for(const rt in rv.recordTypes) {
                        if (rv.recordTypes[rt].label != "Master" && rv.recordTypes[rt].label.indexOf('Locked') < 0) {
                            recordTypes.push(rv.recordTypes[rt]);
                        }
                    }
                    if (recordTypes.length == 1) {
                        component.set("v.recordTypeName", recordTypes[0].label);
                        component.set("v.recordTypeId", recordTypes[0].value);
                        console.log('recordtype set to', recordTypes[0].value);
                    }
                    component.set('v.recordTypes', recordTypes);
                    console.log('# of recordtypes: ' + recordTypes.length);
                    }catch(ex) {
                        console.log('exception', ex);                        
                    }
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
        console.log('[SampleOrder.helper.getMySampleOrders]');
        component.set("v.isLoading", true);
        var action = component.get("c.getSampleOrders");
        action.setCallback(this, function(response) {
            console.log('[SampleOrder.helper.getMySampleOrders] component isvalid', component.isValid());
            if (component.isValid()) {
                var callState = response.getState();
                console.log('[SampleOrder.helper.getMySampleOrders] callstate', callState);
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