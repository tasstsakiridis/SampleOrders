({
	doInit : function(component, event, helper) {
        component.set("v.isLoading", true);
        helper.doInit(component);
        helper.getDataTableColumns(component);  
        helper.getMySampleOrders(component);
	},
        
    handleNewButtonSelect : function(component, event, helper) {
        var selectedRecordTypeId = event.getParam("value");
        var recordTypes = component.get("v.recordTypes");
        recordTypes.forEach((rt) => {
            if (rt.value == selectedRecordTypeId) {
                component.set("v.recordTypeName", rt.label);
                return true;
            }
        });
        component.set("v.recordTypeId", selectedRecordTypeId);
        console.log('selectedRecordType: ' + selectedRecordTypeId);
        
        var listView = component.find("listView");
        $A.util.addClass(listView, 'slds-hide');
        component.set("v.isEditingOrder", true);

        var orderForm = component.find("orderForm");
        orderForm.newSampleOrder();
        
    },

    handleNewButtonClick : function(component, event, helper) {                
        var listView = component.find("listView");
        $A.util.addClass(listView, 'slds-hide');
        component.set("v.isEditingOrder", true);
        var orderForm = component.find("orderForm");
        orderForm.newSampleOrder();
        
    },
    handleMyOrdersToggle : function(component, event, helper) {
        helper.toggleMyOrders(component);
    },
    handleRefreshButtonClick : function(component, event, helper) {
    	helper.getMySampleOrders(component);  
    },
    handleFormError : function(component, event, helper) {
        alert('form error');
    },
    handleSortByRequestedBy : function(component, event, helper) {
        component.set("v.isRequestedBySort", true);
        component.set("v.isRequestedDateSort", false);
        let sortBy = event.currentTarget.dataset.id;
        console.log('sort by requested by: sortby', sortBy);
        helper.sortData(component, sortBy);
    },
    handleSortByRequestedDate : function(component, event, helper) {
        component.set("v.isRequestedBySort", false);
        component.set("v.isRequestedDateSort", true);
        let sortBy = event.currentTarget.dataset.id;
        console.log('sort by requested date: sortby', sortBy);
        helper.sortData(component, sortBy);
    },
    handleRowSelected : function(component, event, helper) {
        try {
            var orderId = event.target.getAttribute('data-order-id');
            console.log('[SampleOrder.controller.handleRowSelected] orderId', orderId);
            var listView = component.find("listView");
            $A.util.addClass(listView, 'slds-hide');
            component.set("v.isEditingOrder", true);
            var orderForm = component.find("orderForm");
            console.log('[SampleOrder.controller.handleRowSelected] orderForm', orderForm);           
            orderForm.loadSampleOrder(orderId);
            /*
            console.log('event', orderId);
            var ev = component.getEvent('bfLightningEvent');
            ev.setParams({
                "eventName": "load",
                "recordId" : orderId
            });
            ev.fire();
            */
        }catch(ex) {
            console.log('ex', ex.toString());
        }
    },
    handleLightningEvent : function(component, event, helper) {
        event.stopPropagation();
        var eventName = event.getParam("eventName");
        console.log('[SampleOrder.controller.handleLightningEvent] eventname', eventName);
        if (eventName.substr(0,5) == 'close') {
            if (eventName.indexOf('refresh') > -1) {
                helper.getMySampleOrders(component);
            }
            
            component.set("v.isEditingOrder", false);
            var listView = component.find("listView");
            $A.util.removeClass(listView, 'slds-hide');
            
        }
    }     
})