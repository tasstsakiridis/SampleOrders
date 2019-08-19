({
	doInit : function(component, event, helper) {
        component.set("v.isLoading", true);
        helper.getDataTableColumns(component);  
        helper.getMySampleOrders(component);
	},
        
    handleNewButtonClick : function(component, event, helper) {        
        var listView = component.find("listView");
        $A.util.addClass(listView, 'slds-hide');
        var orderForm = component.find("orderForm");
        orderForm.newSampleOrder();
        
    },
    handleRefreshButtonClick : function(component, event, helper) {
    	helper.getMySampleOrders(component);  
    },
    handleFormError : function(component, event, helper) {
        alert('form error');
    },
    handleRowSelected : function(component, event, helper) {
        try {
            var orderId = event.target.getAttribute('data-order-id');
            console.log('[SampleOrder.controller.handleRowSelected] orderId', orderId);
            var listView = component.find("listView");
            $A.util.addClass(listView, 'slds-hide');
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
    
/*
             
            <aura:if isTrue="{!or(v.isSF1==false,$Browser.formFactor=='TABLET',$Browser.formFactor=='PHONE')}">
                <aura:if isTrue="{!v.objectDescribe.canInsert==true}">
                    <div class="slds-clearfix">
                        <div class="slds-float_right slds-m-right_medium slds-m-top_medium">
                            <lightning:button label="New" iconName="utility:new" onclick="{!c.handleNewButtonClick}"/>
                        </div>
                    </div>
                    
                </aura:if>
            </aura:if>
                            <!--<lightning:button label="New" iconName="utility:new" onclick="{!c.handleNewButtonClick}"/>-->
        
            <lightning:listView aura:id="sampleOrdersListView"
                                objectApiName="SAP_Interfaced_Data__c"
                                listName="MySampleOrders"
                                rows="10"
                                showActionBar="false"
                                enableInlineEdit="false"
                                showRowLevelActions="true" />
*/     
})