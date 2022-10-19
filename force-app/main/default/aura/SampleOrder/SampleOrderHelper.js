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
                    component.set("v.userPhone", rv.record.MobilePhone);
                    component.set("v.marketId", rv.value);
                    component.set('v.marketName', rv.description);
                    component.set('v.marketISOCode', rv.itemId);
                    component.set('v.userRole', rv.record == undefined || rv.record.UserRole == undefined ? '' : rv.record.UserRole.Name);
                    var leadTime = 0;
                    if (rv.label != undefined) {
                        leadTime = parseInt(rv.label);
                    }
                    component.set('v.leadTime', leadTime);
                    console.log('[SampleOrder.helper.getUserDetails] marketName', rv.description);
                    console.log('[SampleOrder.helper.getUserDetails] userRole', rv.record.UserRole.Name);
                    console.log('[SampleOrder.helper.getUserDetails] leadTime, rv.label', leadTime, rv.label);
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
                    component.set("v.allSampleOrders", rv);
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
    },
    toggleMyOrders : function(component) {
        var showMyOrders = component.get("v.showMyOrders");
        showMyOrders = !showMyOrders;
        component.set("v.showMyOrders", showMyOrders);
        var userId = component.get("v.userId");
        console.log("showMyOrders", showMyOrders);
        var allSampleOrders = component.get("v.allSampleOrders");
        console.log('[toggleMyOrders] allSamplerOrders', allSampleOrders);
        if (showMyOrders) {
            var sampleOrders = allSampleOrders.filter(s => s.CreatedById == userId);
            component.set("v.mySampleOrders", sampleOrders);    
            //component.set("v.myOrdersButtonLabel", component.get("v.lbl_MyOrders"));
        } else {
            component.set("v.mySampleOrders", allSampleOrders);
            //component.set("v.myOrdersButtonLabel", component.get("v.lbl_AllOrders"));
        }
    },
    sortData : function(component, sortBy) {
        let sortedColumn = component.get("v.sortedColumn");
        let isAsc = component.get("v.isAsc");
        if (sortedColumn == sortBy) {
            isAsc = !isAsc;
        } else {
            isAsc = true;
        }
        component.set("v.isAsc", isAsc);
        component.set("v.sortedColumn", sortBy);
        console.log('[helper.sortData] isAsc', isAsc);
        console.log('[helper.sortData] sortBy', sortBy);
        let isReverse = isAsc ? 1 : -1;
        var orders = component.get("v.mySampleOrders");
        orders = orders.sort((a, b) => {
            a = a[sortBy] ? a[sortBy].toLowerCase() : '';
            b = b[sortBy] ? b[sortBy].toLowerCase() : '';
            
            return a > b ? 1 * isReverse : -1 * isReverse;
        });
        component.set("v.mySampleOrders", orders);
        console.log('[helper.sortData] orders', orders);
    }
})