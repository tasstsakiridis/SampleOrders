({
	doInit : function(component, event, helper) {
        component.set("v.countryOptions", helper.getCountryOptions());
		component.set("v.provinceOptions", helper.getProvinceOptions(component, component.get("v.country")));
        component.set("v.itemsButtonLabel", $A.get('$Label.c.Add_Item'));

        var maxInputLengthStr = component.get("v.maxInputLength");
        maxInputLengthStr = maxInputLengthStr.replace("{0}", "35");
        console.log('maxInputLenght', maxInputLengthStr);
        component.set("v.maxInputLength", maxInputLengthStr);

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
        helper.getStorerooms(component);
        helper.getPromotionActivities(component);
        helper.getPicklistValuesForRecordType(component);
	},
    handleCountryChange : function(component, event, helper) {
        //component.set("v.countryName", event.target.value);
    },
    handleUserMarketChange : function(component, event, helper) {
        console.log('[handleCountryChange] countryName', component.get("v.countryName"));
        console.log('[handleCountryChange] userMarket', component.get('v.userMarket'));
        console.log('[handleCountryChange] marketId', component.get("v.marketId"));
        console.log('[handleCountryChange] userRole', component.get('v.userRole'));
        component.set("v.provinceOptions", helper.getProvinceOptions(component, component.get("v.country")));
        var showPrice = false;
        var showInternationalOrder = false;
        var showCostCenters = false;
        var showAccounts = false;
        var showInternalOrderNumbers = false;
        var useStandardAddressComponent = true;
        var showCaseConversion = false;
        var showShippingInstructions = false;
        var showActivities = false;
        var showSubmitForApproval = true;
        var showRemainingQty = false;
        var showStatusInput = false;
        var lockStatusInput = false;
        var userMarket = helper.getCountryCode(component, component.get("v.userMarket"));
        let approvalStatus = component.get("v.approvalStatus");
        const userRole = component.get("v.userRole");
        console.log('[handleCountryChange] userMarket', userMarket);
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
            showCostCenters = true;
            showShippingInstructions = true;
            showStatusInput = true;
            lockStatusInput = !((userRole == 'Global Administraotr' || userRole == 'TWN_Supplier Chain Manager') && approvalStatus == 'Approved');
        }
        if (userMarket == 'AU') {
            showInternationalOrder = true;
        }
        if (userMarket == 'MX') {
            showActivities = true;
            useStandardAddressComponent = false;  
            showSubmitForApproval = false;      
            showRemainingQty = true; 
        }
        console.log('userMarket', userMarket);
        console.log('showPrice', showPrice);
        console.log('useStandardAddress', useStandardAddressComponent);
        console.log('lockStatusInput', lockStatusInput);
        component.set("v.showPrice", showPrice);
        component.set("v.showInternationalOrder", showInternationalOrder);
        component.set("v.showCostCenters", showCostCenters);
        component.set("v.showAccounts", showAccounts);
        component.set("v.useStandardAddressComponent", useStandardAddressComponent);
        component.set("v.showInternalOrderNumbers", showInternalOrderNumbers);
        component.set("v.showCaseConversion", showCaseConversion);
        component.set("v.showShippingInstructions", showShippingInstructions);
        component.set("v.showActivities", showActivities);
        component.set("v.showSubmitForApproval", showSubmitForApproval);
        component.set("v.showRemainingQty", showRemainingQty);
        component.set("v.showStatusInput", showStatusInput);
        component.set("v.lockStatusInput", lockStatusInput);
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
        try {
            var theSampleOrder = component.get("v.theSampleOrder");
            var isStoreroomRequest = false;
            var useStandardAddressComponent = component.get("v.useStandardAddressComponent");
            let recordTypeName = component.get("v.recordTypeName");
            var userName = component.get("v.userName");
            var userPhone = component.get("v.userPhone");
            var showInternationalOrder = component.get("v.showInternationalOrder");
            console.log('userName', userName);
            console.log('userPhone', userPhone);
            console.log('userRole', component.get("v.userRole"));
            if (recordTypeName == 'Sample Order - Storeroom Request') {
                isStoreroomRequest = true;
                useStandardAddressComponent = false;
                theSampleOrder.Contact_Name__c = userName;
                theSampleOrder.Contact_Phone__c = userPhone;
                showInternationalOrder = false;
            } 
            console.log('[SampleOrderForm.controller.handleRecordTypeChange] use standard address component', useStandardAddressComponent);
            component.set("v.theSampleOrder", theSampleOrder);
            component.set("v.isStoreroomRequest", isStoreroomRequest);
            component.set("v.useStandardAddressComponent", useStandardAddressComponent);
            component.set("v.showInternationalOrder", showInternationalOrder);
            helper.getPicklistValuesForRecordType(component);
        }catch(ex) {
            console.log('[SampleOrderForm.controller.handleRecordTypeChange] exception', ex);
        }
    },
    handleCloseToastButtonClick : function(component, event, helper) {
        helper.hideToast(component);
    },
    handleButtonClick : function(component, event, helper) {
        var btn = event.getSource().get("v.name");
        console.log('btn', btn);
        helper.initToast(component);
        const orderLocked = component.get("v.orderLocked");
        const userMarket = component.get("v.userMarket");
        const lockStatusInput = component.get("v.lockStatusInput");
        const theSampleOrder = component.get("v.theSampleOrder");
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
                if (userMarket == 'Taiwan' && orderLocked == true) {
                    component.set("v.disableButtons", lockStatusInput);
                }
            } else {
	            helper.closeSampleOrderDialog(component);                
            }
        } else if (btn == "additems") {  
            if (helper.canAddItems(component)) {
                component.set("v.disableButtons", orderLocked);
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
        try {
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
            const picklistValues = component.get("v.allPicklistValues");
            const reasonCode = component.get("v.reasonCode");
            var reasonCodePicklistValues = picklistValues["Reason_Code__c"].picklistValues;
            var picklistValuesForClassification = reasonCodePicklistValues.filter(r => r.description == classification);
            console.log('[SampleOrderForm.controller.handleClassificationChange] picklistValuesForClassification', picklistValuesForClassification);
            var reasonCodes = [{"label":"", "value":""}];


            for(var i = 0; i < picklistValuesForClassification.length; i++) {
                reasonCodes.push({"label":picklistValuesForClassification[i].label, "value":picklistValuesForClassification[i].value, "selected":reasonCode == picklistValuesForClassification[i].value});
            }
            console.log('[SampleOrderForm.controller.handleClassificationChange] picklistValue', picklistValues);
            console.log('[SampleOrderForm.controller.handleClassificationChange] reasoncodePicklistValues', reasonCodePicklistValues);
            console.log('[SampleOrderForm.controller.handleClassificationChange] reasonCodes', reasonCodes);
            reasonCodes.sort(function(a, b) {
                let x = a.label.toLowerCase();
                let y = b.label.toLowerCase();
                if (x < y) { return -1; }
                if (x > y) { return 1; }
                return 0; 
            });
            component.set("v.reasonCodes", reasonCodes);
        }catch(ex) {
            console.log('[handleClassificationChange] exception', ex);
        }
    },
    handleInternationalOrderChange : function(component, event, helper) {
        /*
        const theSampleOrder = component.get("v.theSampleOrder");
        console.log('[handleInternationalOrderChange] internationalOrder', theSampleOrder.Is_International_Order__c);
        const userStandardAddressComponent = !theSampleOrder.Is_International_Order__c;
        console.log('[handleInternationOrderChange] use standard address component', userStandardAddressComponent);
        component.set("v.useStandardAddressComponent", userStandardAddressComponent);
        */
    },
    handleIsGiftChange : function(component, event, helper) {
        const theSampleOrder = component.get('v.theSampleOrder');
        console.log('[handleGiftChange] is gift', theSampleOrder.Is_Gift__c);
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
    handleStoreroomSelectionChange : function(component, event, helper) {
        try {
            helper.setBusinessDetailsFromStoreroom(component);
        } catch(ex) {
            console.log('[handleStoreroomSelectionChange] exception', ex);
        }
    },
    handlePromotionActivitySelectionChange : function(component, event, helper) {
        try {
            //helper.setBusinessDetailsFromActivity(component);
            helper.filterProductsToActivityProducts(component);
        } catch(ex) {
            console.log('[handlePromotionActivityChange] exception', ex);
        }
    },
    handleOrderStatusChange : function(component, event, helper) {
        try {
            let status = component.get("v.orderStatus");
            let sampleOrder = component.get("v.theSampleOrder");
            sampleOrder.Order_Status__c = status;
            component.set("v.theSampleOrder", sampleOrder);
        }catch(ex) {
            console.log('[handleApprovalStatusChange] exception', ex);
        }
    },
    handleOrderChannelSelectionChange : function(component, event, helper) {
        //let orderChannel = component.get("v.orderChannel");
        //let sampleOrder = component.get("v.theSampleOrder")
    },
    handleReasonCodeSelectionChange : function(component, event, helper) {

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