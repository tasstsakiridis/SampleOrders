({
	doInit : function(component, event, helper) {
        component.set("v.countryOptions", helper.getCountryOptions());
		component.set("v.provinceOptions", helper.getProvinceOptions(component, component.get("v.country")));
        component.set("v.itemsButtonLabel", $A.get('$Label.c.Add_Item'));

        component.set("v.approvalHistoryColumns", [
            { label: 'Step Name', fieldName: 'StepName', type: 'text' },
            { label: 'Date', fieldName: 'CompletedDate', type: 'date' },
            { label: 'Status', fieldName: 'Status', type: 'text' },
            { label: 'Assigned To', fieldName: 'Actor', type: 'text' }
        ]);

        helper.setupProductColumns(component);   
        helper.getBannerGroups(component);
        helper.getStorageLockers(component);
        helper.getInternalOrderNumbers(component);
        helper.getPicklistValuesForRecordType(component);
	},
    handleCountryChange : function(component, event, helper) {
        //component.set("v.countryName", event.target.value);
    },
    handleUserMarketChange : function(component, event, helper) {
        console.log('[handleCountryChange] countryName', component.get("v.countryName"));
        console.log('[handleCountryChange] userMarket', component.get('v.userMarket'));
        console.log('[handleCountryChange] marketId', component.get("v.marketId"));
        component.set("v.provinceOptions", helper.getProvinceOptions(component, component.get("v.country")));
        var showPrice = false;
        var showInternationalOrder = false;
        var showCostCenters = false;
        var showAccounts = false;
        var showInternalOrderNumbers = false;
        var useStandardAddressComponent = true;
        var showCaseConversion = false;
        var userMarket = helper.getCountryCode(component, component.get("v.userMarket"));
        if (userMarket == 'GB') {
            showPrice = true;   
            showCostCenters = true;            
            useStandardAddressComponent = false;         
            showInternalOrderNumbers = true;     
        }
        if (userMarket == 'TW') {
            showPrice = true;
            useStandardAddressComponent = false;
            showAccounts = true;
            showCaseConversion = true;
        }
        if (userMarket == 'AU') {
            showInternationalOrder = true;
        }
        console.log('userMarket', userMarket);
        console.log('showPrice', showPrice);
        console.log('useStandardAddress', useStandardAddressComponent);
        component.set("v.showPrice", showPrice);
        component.set("v.showInternationalOrder", showInternationalOrder);
        component.set("v.showCostCenters", showCostCenters);
        component.set("v.showAccounts", showAccounts);
        component.set("v.useStandardAddressComponent", useStandardAddressComponent);
        component.set("v.showInternalOrderNumbers", showInternalOrderNumbers);
        component.set("v.showCaseConversion", showCaseConversion);
        helper.setupProductTableHeaders(component);
        //helper.updateProvinceOptions(component);
    },
    handleDescribeInfoChange : function(component, event, helper) {
        var describe = component.get("v.objectDescribe");
        var classifications = [];
        if (describe) {
            classifications = describe.fields["Classification__c"].picklistValues;
        }
        //component.set('v.classifications', classifications);
    },
    handleRecordTypeChange : function(component, event, helper) {
        console.log('[SampleOrderForm.controller.handleRecordTypeChange]');
        helper.getPicklistValuesForRecordType(component);
    },
    handleCloseToastButtonClick : function(component, event, helper) {
        helper.hideToast(component);
    },
    handleButtonClick : function(component, event, helper) {
        var btn = event.getSource().get("v.name");
        console.log('btn', btn);
        helper.initToast(component);
        try {
        if (btn.substr(0,4) == "save") {
            console.log('[SampleOrderForm.controller.handleButtonClick] save button clicked');
            component.set("v.closeAfterSave", btn=='saveclose');            
            if (component.get("v.isAddingItems")) {
                helper.saveSampleOrderItems(component);
            } else {
                
                let isValidOrder = helper.validateOrder(component);
                console.log('[SampleOrderForm.controller.handleButtonClick] isValidOrder', isValidOrder);
                if (!isValidOrder.isValid) { 
                    component.set("v.toastTitle", "Error");
                    component.set("v.toastMessage", isValidOrder.msg);
                    var toastPanel = component.find("toastPanel");
                    $A.util.removeClass(toastPanel, "slds-hide");
                    
                    window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
                    return; 
                } else {
		            helper.saveSampleOrder(component);                                    
                }
            }
        } else if (btn == "cancel") {
            if (component.get("v.isAddingItems")) {
                //helper.initProductData(component);
                helper.revertProductChanges(component);
	            component.set("v.isAddingItems", false);                
            } else {
	            helper.closeSampleOrderDialog(component);                
            }
        } else if (btn == "additems") {  
            if (helper.canAddItems(component)) {
	            component.set("v.isAddingItems", true);                
            } else {
                helper.alertUser(component, 'Warning', 'warning', 'Save Order details first before you add items');
            }
        } else if (btn == "submit") {
            helper.submitOrderForApproval(component);
        }
        }catch(ex) {
            console.log('SampleOrderForm.controller.hanlderButtonClick] exception', ex);
        }
    },
    handleBusinessNameChange : function(component, event, helper) {
        let theSampleOrder = component.get("v.theSampleOrder");
        if (theSampleOrder.Business_Name__c.length > 25) {
            helper.alertUser(component, "Warning", 'warning', 'Business Name is too long. Max 25 characters');
            theSampleOrder.Business_Name__c = theSampleOrder.Business_Name__c.substr(0, 25);
            component.set("v.theSampleOrder", theSampleOrder);
        }
    },
    handleContactNameChange : function(component, event, helper) {
        let theSampleOrder = component.get("v.theSampleOrder");
        if (theSampleOrder.Contact_Name__c.length > 70) {
            helper.alertUser(component, "Warning", 'warning', 'Contact Name is too long. Max 70 characters');
            theSampleOrder.Contact_Name__c = theSampleOrder.Contact_Name__c.substr(0, 70);
            component.set("v.theSampleOrder", theSampleOrder);
        }
    },

    handleClassificationChange : function(component, event, helper) {
        console.log('[handleClassificationChange]');
        //let theSampleOrder = component.get("v.theSampleOrder");
        //console.log('classification', theSampleOrder.Classification__c);
        //component.set("v.classification", theSampleOrder.Classification__c);
        let classification = component.get("v.classification");
        console.log('[handleClassificationChange] classification', classification);
        if (classification.indexOf('Duty Free') >= 0) {
            component.set("v.showDutyFreeBanners", true);
        } else {
            component.set("v.showDutyFreeBanners", false);
        }
        let country = component.get("v.country");
        if (country == 'GB') {
            if (classification.indexOf('SD0') >= 0) {
                component.set("v.showCostCenters", false);
                component.set("v.showInternalOrderNumbers", true);
            } else {
                component.set("v.showCostCenters", true);
                component.set("v.showInternalOrderNumbers", false);
            }    

            helper.setupProductTableHeaders(component);
        }
    },
    handleLookupIdChanged : function(component, event, helper) {
        let instanceId = event.getParam('instanceId');
        let recordId = event.getParam('sObjectId');
        let recordName = event.getParam('sObjectName');
        console.log('[SampleOrderForm.controller.handleLookupIdChange] instanceId, recordId, recordName', instanceId, recordId, recordName);
        try {
            component.set("v.accountId", recordId);
            component.set("v.accountName", recordName);
            helper.getAccountDetails(component, recordId);
        }catch(ex) {
            console.log('[SampleOorderrForm.controller.handleLookupIdChanged] exception', ex);
        }
    },

    handleBannerGroupChange : function(component, event, helper) {
        try {
            var bannerGroup = component.find("bannerGroup").get("v.value");
            component.set("v.selectedBannerGroup", bannerGroup);
            console.log('bannergroup', bannerGroup);
        } catch(ex) {
            console.log('[handleBannerGroupChange] exception', ex);
        }
    },
    handleStorageLockerChange : function(component, event, helper) {
      	helper.setBusinessDetailsFromStorageLocker(component);  
    },
    handleStorageLockerSelectionChange : function(component, event, helper) {
        try {
            var storageLocker = component.get("v.storageLocker");
            //component.set("v.storageLocker", storageLocker);
            console.log("storageLocker", storageLocker);
            helper.setBusinessDetailsFromStorageLocker(component);  
            
        } catch(ex) {
            console.log('[handleStorageLockerChange] exception', ex);
        }
    },
    handleCostCenterChange : function(component, event, helper) {
        try {
            //var costCenter = component.find("costCenters").get("v.value");
            //component.set("v.costCenter", costCenter);
            console.log("costcenter", component.get("v.costCenter"));
        } catch(ex) {
            console.log('[handleCostCenterChange] exception', ex);
        }
    },
    handleBrandChange : function(component, event, helper) {
        //var brand = event.getParam("value");
        var brand = component.find('brands').get('v.value');
        console.log('[SampleOrderForm.controller.handleBrandChange] selected brand', brand);
        component.set("v.selectedBrand", brand);
    },
    handleShowSelectedProductsChange : function(component, event, helper) {
    	//helper.filterProducts(component);  
		var showselected = component.get("v.showSelectedProducts");
        console.log('[SampleOrderForm.controller.handleShowSelectedProductsChange] showselected', showselected);
    },
    handleLightningEvent : function(component, event, helper) {
        var eventName = event.getParam("eventName");
        console.log('[SampleOrderForm.controller.handleLightningEvent] eventname', eventName);
        if (eventName == 'load') {
            var recordId = event.getParam("recordId");
            helper.getSampleOrder(component, recordId);
        }
    },
    newSampleOrder : function(component, event, helper) {
    	helper.initSampleOrder(component);
        var orderForm = component.find("theOrderForm");
        $A.util.removeClass(orderForm, "slds-hide");                        
        
    },
    loadSampleOrder : function(component, event, helper) {
        var args = event.getParam("arguments");
        var recordId = args.recordId;
        console.log('[SampleOrderForm.controller.loadSampleOrder] recordId', recordId);
    	helper.loadSampleOrder(component, recordId);  
        helper.getApprovalHistory(component, recordId);
    },
    handleCloseDialogChange : function(component, event, helper) {
        helper.closeSampleOrderDialog(component);
    }    
    
})