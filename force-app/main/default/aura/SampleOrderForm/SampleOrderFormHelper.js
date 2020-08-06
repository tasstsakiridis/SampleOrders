({
    countryProvinceMap: {
        US: [
            {'label': 'California', 'value': 'CA'},
            {'label': 'Texas', 'value': 'TX'},
            {'label': 'Washington', 'value': 'WA'},
        ],
        CN: [
            {'label': 'GuangDong', 'value': 'GD'},
            {'label': 'GuangXi', 'value': 'GX'},
            {'label': 'Sichuan', 'value': 'SC'},
        ],
        VA: [],
        AU : [
            {label:'New South Wales', value:'NSW'},
            {label:'Queensland', value:'QLD'},
            {label:'Victoria', value:'VIC'},
            {label:'South Australia', value:'SA'},
            {label:'Western Australia', value:'WA'},
            {label:'Northern Territiry', value:'NT'},
            {label:'Australian Capital Territory', value:'ACT'},
            {label:'Tasmania', value:'TAS'}
        ],  
        GB: [
            {label:'London', value:'London'},
            {label:'Essex', value:'Essex'},
            {label:'Sussex', value:'Sussex'}
        ]  
    },
    countryOptions: [
        {'label': 'Australia', 'value': 'AU'},
        {'label': 'United Kingdom', 'value': 'GB' }
    ],

    getProvinceOptions: function(component, country) {
        console.log('[SampleOrderForm.helper.getProvinceOptions] country', country);
        console.log('[SampleOrderForm.helper.getProvinceOptions] states', this.countryProvinceMap[country]);
        console.log('[SampleOrderForm.helper.getProvinceOptions] countryOptions', this.countryOptions);
        try {
        for(var i = 0; i < this.countryOptions.length; i++) {
            if (this.countryOptions[i].value == country) {
                component.set("v.countryName", this.countryOptions[i].label);                
            }
        }
        }catch(ex) {
	        console.log('[SampleOrderForm.helper.getProvinceOptions] ex', ex);            
        }
        
        return this.countryProvinceMap[country];
    },
    getCountryOptions: function() {
        return this.countryOptions;
    },
    
    updateProvinceOptions : function(component) {
        var country = component.get("v.country");
        console.log('[SampleOrderForm.helper.updateProvinceOptions] country', country);                                                        
        component.set("v.provinceOptions", this.getProvinceOptions(component, country));
        console.log('[SampleOrderForm.helper.updateProvinceOptions] provinceOptions', component.get('v.provinceOptions'));
    },
    doInit : function(component) {
    	this.setupProductColumns(component); 
    },
    getPicklistValuesForRecordType : function(component) {
        var recordTypeName = component.get("v.recordTypeName");
        console.log('[SampleOrderForm.helper.getPicklistValues] recordTypeId', recordTypeName);
    	var action = component.get("c.getPicklistValuesForRecordType");
        action.setParams({
            recordType: recordTypeName
        });
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    try {
                        var rv = response.getReturnValue();
                        console.log('[SampleOrderForm.Helper.getPicklistValues] picklistValues', rv);
                        let classification = component.get("v.classification");
                        let costCenter = component.get("v.costCenter");

                        var classifications = [{"label":"", "value":""}];
                        var costCenters = [{"label":"", "value":""}];
                        for(var i = 0; i < rv.length; i++) {
                            if (rv[i].Field_Name__c == 'Classification__c') {                                
                                classifications.push({"label":rv[i].Value__c, "value":rv[i].Value__c, "selected":classification==rv[i].Value__c});
                            } else if (rv[i].Field_Name__c == 'Cost_Center__c') {
                                costCenters.push({"label":rv[i].Value__c, "value":rv[i].Value__c, "selected":costCenter == rv[i].Value__c});
                            }
                        }                    
                        classifications.sort(function(a, b) {
                            let x = a.label.toLowerCase();
                            let y = b.label.toLowerCase();
                            if (x < y) { return -1; }
                            if (x > y) { return 1; }
                            return 0; 
                        });
                        
                        costCenters.sort(function(a, b) {
                            let x = a.label.toLowerCase();
                            let y = b.label.toLowerCase();
                            if (x < y) { return -1; }
                            if (x > y) { return 1; }
                            return 0; 
                        });
                    
                        console.log('[SampleOrderForm.helper.getPicklistValues] classifications', classifications);
                        console.log('[SampleOrderForm.helper.getPicklistValues] cost centers', costCenters);
                        component.set("v.classifications", classifications);
                        component.set("v.costCenters", costCenters);
                    }catch(ex) {
                        console.log('[SampleOrderForm.helper.getPicklistValues] exception', ex);                        
                    }
                    
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getPicklistValues] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getPicklistValues] callback returned in error.", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);

    },
    setupProductTableHeaders : function(component) {
        component.set("v.productColumns", [
            { label: 'Product', fieldName: 'Name', type:'text', isVisible: true },
            { label: 'SKU', fieldName: 'ProductCode__c', type: 'text', isVisible: component.get("v.showSKU")},
            { label: 'Brand', fieldName: 'Brand_Name__c', type: 'text', isVisible: true },
            { label: 'Pack Qty', fieldName: 'Pack_Quantity__c', type: 'number', editable: false, isVisible: true },
            { label: 'Price', fieldName: 'Price__c', type:'number', editable: false, isVisible: component.get("v.showPrice") },
            { label: 'Quantity', fieldName: 'Quantity__c', type:'number', editable:'true', isVisible: true },
            { label: '# of Bottles', fieldName: 'Units__c', type: 'number', editable: false , isVisible: true}
        ]);        
    },
    setupProductColumns : function(component) {
        /*
        var productColumns = [];
        productColumns.push({ label: 'Product', fieldName: 'Name', type:'text' });
        if (component.get("v.showSKU")) {
            productColumns.push({ label: 'SKU', fieldName: 'ProductCode__c', type: 'text' });
        }
        productColumns.push({ label: 'Brand', fieldName: 'Brand_Name__c', type: 'text' });
        productColumns.push({ label: 'Pack Qty', fieldName: 'Pack_Quantity__c', type: 'number', editable: false });
        if (component.get("v.showPrice")) {
            productColumns.push({ label: 'Price', fieldName: 'Price__c', type:'number', editable: false });
        }
        productColumns.push({ label: 'Quantity', fieldName: 'Quantity__c', type:'number', editable:'true' });
        productColumns.push({ label: '# of Bottles', fieldName: 'Units__c', type: 'number', editable: false });
        */
        this.setupProductTableHeaders(component);

        var recordTypeName = component.get("v.recordTypeName");
    	var action = component.get("c.getProducts");
        action.setParams({
            recordTypeName: recordTypeName
        });
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrderForm.Helper.getProducts] object', rv);
                    var brands = [{"label":"--All--", value:""}];
                    var brandIndex = [];
                    for(var i = 0; i < rv.length; i++) {
                        if (brandIndex.indexOf(rv[i].brandName) < 0) {
                            brandIndex.push(rv[i].brandName);
                            brands.push({"label":rv[i].brandName,"value":rv[i].brandName});
                        }
                    }
                    brands.sort(function(a, b) { 
                        let x = a.label.toLowerCase();
                        let y = b.label.toLowerCase();
                        if (x < y) { return -1; }
                        if (x > y) { return 1; }
                        return 0; 
                    });
                    console.log('[SampleOrderForm.helper.getProducts] brands', brands);
                    component.set("v.productData", rv);
                    component.set("v.data", rv);
                    component.set("v.brands", brands);
                    
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getProducts] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getProducts] callback returned in error.", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
    },
    getBannerGroups : function(component) {
        console.log('getBannerGroups');
    	var action = component.get("c.getBannerGroups");
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrderForm.Helper.getBannerGroups] bannergroups', rv);
                    var banners = [{"label":"", value:""}];
                    for(var i = 0; i < rv.length; i++) {
                        banners.push({"label":rv[i].Name,"value":rv[i].Id});
                    }
                    banners.sort(function(a, b) { 
                        let x = a.label.toLowerCase();
                        let y = b.label.toLowerCase();
                        if (x < y) { return -1; }
                        if (x > y) { return 1; }
                        return 0; 
                    });
                    console.log('[SampleOrderForm.helper.getBannerGroups] bannergroups', banners);
                    component.set("v.bannerGroups", banners);
                    
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getBannerGroups] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getBannerGroups] callback returned in error.", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
    },
    getStorageLockers : function(component) {
        console.log('getStorageLockers');
    	var action = component.get("c.getStorageLockers");
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrderForm.Helper.getStorageLockers] storageLoockers', rv);
                    var lockers = [{"label":"", value:""}];
                    for(var i = 0; i < rv.length; i++) {
                        lockers.push({"label":rv[i].Name + '-' + rv[i].ShippingCity,"value":rv[i].Id, account: rv[i]});
                    }
                    lockers.sort(function(a, b) { 
                        let x = a.label.toLowerCase();
                        let y = b.label.toLowerCase();
                        if (x < y) { return -1; }
                        if (x > y) { return 1; }
                        return 0; 
                    });
                    console.log('[SampleOrderForm.helper.getStorageLockers] storageLockers', lockers);
                    component.set("v.storageLockers", lockers);
                    component.set("v.showStorageLockers", lockers.length > 1);
                    
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getStorageLockers] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getStorageLockers] callback returned in error.", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
    },

    initSampleOrder : function(component) {
        var theSampleOrder = { 'sObjectType': 'SAP_Interfaced_Data__c', 'Approval_Status__c':'New' };
        console.log('[SampleOrderForm.helper.initSampleOrder] sampleorder', theSampleOrder);
		component.set('v.theSampleOrder', theSampleOrder);  
        component.set("v.disableAddItems", false);
        component.set("v.isAddingItems", false);
        component.set("v.showSelectedProducts", false);
        component.set("v.canSubmit", false);
        component.set("v.orderLocked", false);
        component.set("v.classification", null);
        component.set("v.costCenter", null);
        component.set("v.selectedBannerGroup", null);
        component.set("v.storageLocker", null);
        
        this.initToast(component);
        let deletedRows = [];
        component.set("v.deletedRows", deletedRows);
        
        //component.set("v.country", "AU");
        //component.set("v.businessState", "NSW");
		component.set("v.isVisible", false);
		component.set("v.isVisible", true);  
        
        this.initProductData(component);
    },
    initProductData : function(component) {
        component.set("v.deletedRows", []);
        component.set('v.isAddingItems', false);
        component.set('v.selectedBrand', '');
        var rows = component.get("v.productData");
        if (rows) {
            for(var i = 0; i < rows.length; i++) {
                rows[i].id = '';
                rows[i].quantity = 0;
                rows[i].units = 0;
            }
            component.set("v.productData", rows);            
        }
            
    },
    revertProductChanges : function(component) {
        let theOrder = component.get("v.theSampleOrder");
        console.log('[SampleOrderForm.helper.revertproductChanges] theOrder', theOrder);
        var found = false;
        if (theOrder.SAP_Interfaced_Data_Items__r && theOrder.SAP_Interfaced_Data_Items__r.length > 0) {
            var products = component.get("v.productData");
            for(var i = 0; i < products.length; i++) {
                found = false;
                for(var j = 0; j < theOrder.SAP_Interfaced_Data_Items__r.length; j++) {                    
                    if (products[i].productId == theOrder.SAP_Interfaced_Data_Items__r[j].Product__c) {
                        found = true;
                        products[i].quantity = theOrder.SAP_Interfaced_Data_Items__r[j].Quantity__c;
                        products[i].units = products[i].quantity * products[i].packQty;
                        break;
                    }
                }

                if (!found) {
                    products[i].quantity = 0;
                    products[i].units = 0;
                }
            }
            
            component.set("v.productData", products);
        }

    },

    clearErrorMessage : function(component, fld) {
        console.log('[SampleOrderForm.helper.clearErrorMessage] clearing message for ', fld);
        let el = component.find(fld);
        $A.util.removeClass(el, "slds-has-error");
        $A.util.addClass(el, "hide-error-message");            
    },
        
    closeSampleOrderDialog : function(component) {
        console.log("[SampleOrderForm.helper.closeSampleOrderDialog]");
        try {
            this.initSampleOrder(component);
            var orderForm = component.find("theOrderForm");
            $A.util.addClass(orderForm, 'slds-hide');
            var evCancel = component.getEvent("bfLightningEvent");
            evCancel.setParams({
                "eventName" : "closeandrefresh" 
            });
            evCancel.fire();
        }catch(ex) {
            console.log('[SampleOrderForm.helper.closeSampleOrderDialog] exception: ' + ex.toString());
        }
    },
    filterProducts : function(component) {
    	var showSelectedProducts = component.get("v.showSelectedProducts");
        var currentData = component.get("v.data");
        /*
        if (showSelectedProducts) {
            component.set("v.productData", currentData);
            var selectedProducts = component.get("v.selectedProducts");
            component.set("v.data", selectedProducts);
        } else {
			var products = component.get("v.productData");
            component.set("v.data", products);
        }
        */
    },
    canAddItems : function(component) {
    	var order = component.get("v.theSampleOrder");        
        if (order == null || order.Id == null || order.Id == '') {
            return false;
        }
        
        return true;
    },
    alertUser : function(component, title, alertType, msg) {
        component.set("v.toastTitle", title);
        component.set("v.toastMessage", msg);
        var toastPanel = component.find("toastPanel");
        $A.util.removeClass(toastPanel, "slds-hide");
    },
    hideToast : function(component) {
        var toastPanel = component.find("toastPanel");
        $A.util.addClass(toastPanel, "slds-hide");    	        
    },
    initToast : function(component) {
        var toastPanel = component.find("toastPanel");
        $A.util.addClass(toastPanel, "slds-hide");    	        
        component.set("v.toastTitle", "");
        component.set('v.toastMessage', '');
    },   
    setBusinessDetailsFromStorageLocker : function(component) {
        var storageLocker = component.get("v.storageLocker");
        var lockers = component.get("v.storageLockers");
        var theSampleOrder = component.get("v.theSampleOrder");
        console.log('[sampleorderform.helper.setbusinesdetails] storageLocker', storageLocker);
        console.log('[sampleorderform.helper.setbusinesdetails] lockers', lockers);

        if (storageLocker == '') {
            theSampleOrder.Business_Name__c = '';
            theSampleOrder.Business_Address__c = '';
            theSampleOrder.Business_City__c = '';
            theSampleOrder.Business_Postcode__c = '';
            
            component.set("v.theSampleOrder", theSampleOrder);
            component.set("v.businessState", '');
        } else {
            if (lockers != null && lockers.length > 0) {
                lockers.forEach(function(l) {
                    if (l.value == storageLocker) {
                        theSampleOrder.Business_Name__c = l.account.Name;
                        theSampleOrder.Business_Address__c = l.account.ShippingStreet;
                        theSampleOrder.Business_City__c = l.account.ShippingCity;
                        theSampleOrder.Business_Postcode__c = l.account.ShippingPostalCode;
                        
                        component.set("v.theSampleOrder", theSampleOrder);
                        component.set("v.businessState", l.account.ShippingState);
                        
                        return true;
                    } 
                });
            }    
        }
    },
    validateOrder : function(component) {
        console.log('[SampleOrderForm.helper.validateOrder]');
    	var theSampleOrder = component.get("v.theSampleOrder");
        var businessState = component.get("v.businessState");
        var country = component.get("v.country");
        let classification = component.get("v.classification");
        let costCenter = component.get("v.costCenter");
        let isValid = true;
        let msg = '';

        if (classification == null || classification == '') { console.log('classification is null'); isValid = false; }
        if (theSampleOrder.Business_Name__c == null || theSampleOrder.Business_Name__c == '') { 
            console.log('business name is null'); 
            msg += '\nBusiness Name is required';
            isValid = false;; 
        } else {
            if (theSampleOrder.Business_Name__c.length > 25) {
                msg += 'Business Name is too long.  Max 25 characters';
                isValid = false;
            }
        }
        if (theSampleOrder.Requested_Delivery_Date__c == null) { console.log('requested delivery date is null'); isValid = false; }
        if (country == null || country == '') { 
            console.log('country is null');  
            isValid = false;
        } else { 
        }
        if (theSampleOrder.Business_Address__c == null || theSampleOrder.Business_Address__c == '') { 
            console.log('shipping street is null');  
            isValid = false;
        } else {
            if (theSampleOrder.Business_Address__c.length > 35) {
                msg += 'Business Address is too long.  Max 35 characters';
                isValid = false;
            }
        }
        if (theSampleOrder.Business_City__c == null || theSampleOrder.Business_City__c == '') { 
            console.log('shipping city is null');  
            isValid = false;
        } else {
            if (theSampleOrder.Business_City__c.length > 35) {
                msg += 'Business City is too long.  Max 35 characters';
                isValid = false;
            }
        }
        if (theSampleOrder.Business_Postcode__c == null || theSampleOrder.Business_Postcode__c == '') { 
            console.log('shipping postcode is null');  
            isValid = false;
        } else {
            if (theSampleOrder.Business_Postcode__c.length > 9) {
                msg += 'Business PostCode is too long.  Max 9 characters';
                isValid = false;
            }
        }
        if (country != 'GB') {
            if (businessState == null || businessState == '') { 
                console.log('business state is null'); 
                isValid = false; 
            } else {
                
            }		 
        }

        if (theSampleOrder.Contact_Name__c == null || theSampleOrder.Contact_Name__c == '') { 
            console.log('contact name is null');  
            msg += 'Contact Name is required<br />';
            isValid = false;
        } else {
            if (theSampleOrder.Contact_Name__c.length > 70) {
                msg += 'Contact Name is too long.  Max 70 characters.';
                isValid = false;
            }
        }
        if (theSampleOrder.Contact_Phone__c == null || theSampleOrder.Contact_Phone__c == '') { 
            console.log('contact phone is null');  
            msg += 'Contact Phone is required<br />';
            isValid = false;
        }
        if (theSampleOrder.Reason__c == null || theSampleOrder.Reason__c == '') { 
            console.log('Reason is null');  
            msg += 'You must enter a Reason.';
            isValid = false;
        }
        
        if (country == 'UK' && classification != null && classification.indexOf('SD0') == -1) {
            if (costCenter == null || costCenter == '') { 
                console.log('cost center is null'); 
                msg += 'You must select a cost center.';
                isValid = false; 
            }
        }
        return { msg: msg, isValid: isValid };
    },
    loadSampleOrder : function(component, recordId) {
        component.set("v.isLoading", true);
    	var action = component.get("c.getSampleOrder");
        action.setParams({
            "recordId" : recordId 
        });      
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log("[SampleOrderForm.helper.loadSampleOrder] returnvalue", rv);
                    try {
                        component.set("v.theSampleOrder", rv);
                        var orderForm = component.find("theOrderForm");
                        $A.util.removeClass(orderForm, "slds-hide");         
                        component.set("v.recordTypeName", rv.RecordType.Name);               
                        component.set("v.recordTypeId", rv.RecordTypeId);
                        component.set("v.classification", rv.Classification__c);

                        let country = component.get("v.country");
                        let showCostCenter = false;
                        if (country == 'GB' && rv.Classification__c.indexOf('SD0') < 0) {
                            showCostCenter = true;
                        }
                        component.set("v.showCostCenters", showCostCenter);
                        component.set("v.costCenter", rv.Cost_Center__c);

                        component.set("v.storageLocker", rv.Storage_Locker__c)
                        let countryCode = rv.Business_Country__c == undefined ? 'AU' : rv.Business_Country__c;
                        component.set("v.country", countryCode);
                        for(var i = 0; i < this.countryOptions.length; i++) {
                            if (this.countryOptions[i].value == countryCode) {
                                component.set("v.countryName", this.countryOptions[i].label);
                            }
                        }
                        component.set("v.businessState", rv.Business_State__c);                        
                        if (rv.Approval_Status__c == null || rv.Approval_Status__c == '') { rv.Approval_Status__c = 'New'; }
                        var banner = component.find("approvalStatus");
                        $A.util.removeClass(banner, "status_New");
                        $A.util.removeClass(banner, "status_Submit");
                        $A.util.removeClass(banner, "status_Approved");
                        $A.util.removeClass(banner, "status_Declined");
                        $A.util.removeClass(banner, "status_Canceled");
                        $A.util.addClass(banner, "status_"+rv.Approval_Status__c);
                        
                        if (rv.Classification__c.indexOf('Duty Free') >= 0) {
                            component.set("v.showBannerGroups", true);                            
                        } else {
                            component.set("v.showBannerGroups", false);
                        }
                        if (rv.Banner_Group__c != null) {
                            component.set("v.selectedBannerGroup", rv.Banner_Group__c);
                        }
                        let costCenters = component.get("v.costCenters");
                        if (costCenters != null) {
                            for(var i = 0; i < costCenters.length; i++) {
                                if (costCenters[i].value == rv.Cost_Center__c) {
                                    costCenters[i].selected = true; break;
                                }
                            }
                        }
                        let classifications = component.get("v.classifications");
                        if (classifications != null) {
                            for(var i = 0; i < classifications.length; i++) {
                                if (classifications[i].value == rv.Classification__c) {
                                    classifications[i].selected = true; break;
                                }
                            }
                        }

                        console.log('[SampleOrderForm.helper.loadSampleOrder] items', rv.SAP_Interfaced_Data_Items__r);
                        var bannerText = component.find("bannerText");
                        if (rv.Approval_Status__c == 'New') {
                            component.set("v.orderLocked", false);
                            component.set("v.canSubmit", true);
					        component.set("v.itemsButtonLabel", $A.get('$Label.c.Add_Item'));
                            $A.util.removeClass(banner, "bannerText_white");
                        } else {
                            component.set("v.orderLocked", true);
                            component.set("v.canSubmit", false);
                            component.set("v.showSelectedProducts", true);
					        component.set("v.itemsButtonLabel", $A.get('$Label.c.Items'));
                            $A.util.addClass(banner, "bannerText_white");
                        }
                            
                        if (rv.SAP_Interfaced_Data_Items__r && rv.SAP_Interfaced_Data_Items__r.length > 0) {
                            var products = component.get("v.productData");
                            for(var i = 0; i < rv.SAP_Interfaced_Data_Items__r.length; i++) {
                                console.log('[SampleOrderForm.helper.loadSampleOrder] sapitem', rv.SAP_Interfaced_Data_Items__r[i]);
                                for(var j = 0; j < products.length; j++) {
                                    if (products[j].productId == rv.SAP_Interfaced_Data_Items__r[i].Product__c) {
                                        products[j].id = rv.SAP_Interfaced_Data_Items__r[i].Id;
                                        products[j].quantity = rv.SAP_Interfaced_Data_Items__r[i].Quantity__c;
                                        //products[j].units = products[j].quantity * products[j].packQty;
                                        products[j].units = rv.SAP_Interfaced_Data_Items__r[i].Units__c;
                                        products[j].usedFor = rv.SAP_Interfaced_Data_Items__r[i].Product__r.Used_For__c;
                                        break;
                                    }
                                }
                            }
                            
                            component.set("v.productData", products);
                        }
                        component.set('v.isLoading', false);   
                        component.set("v.disableAddItems", false);
                        
                        let deletedRows = [];
                        component.set("v.deletedRows", deletedRows);
                        
                        console.log('[SampleOrderForm.helper.loadSampleOrder] finished loading order');
                    } catch(ex) {
                        console.log('[SampleOrderForm.helper.loadSampleOrder] exception', ex.toString());
                    }
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.loadSampleOrder] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.loadSampleOrder] callback returned in error.", errors);                    
                }
            }
        });
        $A.enqueueAction(action);
        
    },
    saveSampleOrder : function(component) {
        console.log('[SampleOrderForm.helper.saveSampleOrder]');
        component.set("v.isLoading", true);
        
    	var theSampleOrder = component.get("v.theSampleOrder");
        var businessState = component.get("v.businessState");
        var country = component.get("v.country");
        var bannerGroup = component.get("v.selectedBannerGroup");
        var recordTypeId = component.get("v.recordTypeId");
        var classification = component.get("v.classification");
        var costCenter = component.get("v.costCenter");
        var storageLocker = component.get("v.storageLocker");

        theSampleOrder.Approval_Status__c = 'New';
        theSampleOrder.Business_Country__c = country;
        theSampleOrder.Business_State__c = businessState;
        theSampleOrder.RecordTypeId = recordTypeId;
        theSampleOrder.Classification__c = classification;
        if (bannerGroup != null && bannerGroup.length > 0) {
            theSampleOrder.Banner_Group__c = bannerGroup;
        }
        theSampleOrder.Cost_Center__c = costCenter;
        theSampleOrder.Storage_Locker__c = storageLocker;

        console.log('theSampleOrder', theSampleOrder);
		console.log('theSampleOrder.classification', theSampleOrder.Classification__c);
		var action = component.get("c.saveSampleOrder");
        action.setParams({
            "theSampleOrder" : theSampleOrder 
        });
        action.setCallback(this, function(response) {
            var showToast = false;
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log("[SampleOrderForm.helper.saveSampleOrder] returnvalue", rv);
                    try {
                        component.set("v.theSampleOrder", rv);
                        component.set('v.isLoading', false);
                        var closeAfterSave = component.get("v.closeAfterSave");
                        console.log('[SampleOrderForm.helper.saveSampleOrder] closeAfterSave', closeAfterSave);
                        if (closeAfterSave) {
                            component.set("v.closeDialog", true);
                        } else {
                            component.set("v.disableAddItems", false);
							component.set("v.canSubmit", true);                            
                        }                 
                        
                    } catch(ex) {
                        console.log('[SampleOrderForm.helper.saveSampleOrder] exception', ex.toString());
                    }
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.save] callback returned incomplete.");                    
                    component.set("v.toastTitle", "Error");
                    component.set("v.toastMessage", "Failed to save Sample Order.  The connection may have been interrupted.  Please try again.");
                    component.set("v.isLoading", false);
                    showToast = true;
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.save] callback returned in error.", errors);                    
                    component.set("v.toastTitle", "Error");
                    var msg = '';
                    console.log('[SampleOrderForm.Helper.save] error', errors[0]);
                    if (errors[0].fieldErrors && errors[0].fieldErrors.length > 0) {
                        errors[0].fieldErrors.forEach(function(item) {
                            msg += item.message + '\n';
                        });
                    }
                    if (errors[0].pageErrors && errors[0].pageErrors.length > 0) {
                        errors[0].pageErrors.forEach(function(item) {
                            msg += item.message + '\n';
                        });
                    }    
                
                    component.set("v.toastMessage", "Failed to save Sample Order. " + msg);
                    component.set("v.isLoading", false);
                    showToast = true;
                }
                
                if (showToast) {
                    var toastPanel = component.find("toastPanel");
                    $A.util.removeClass(toastPanel, "slds-hide");
                }
            }
        });
        $A.enqueueAction(action);
        
    },
    saveSampleOrderItems : function(component) {        
        console.log('[SampleOrderForm.helper.saveSampleOrderItems]');
        component.set("v.isLoading", true);
    	var rows = component.get("v.productData");
        let deletedRows = component.get("v.deletedRows");        
        var theSampleOrder = component.get("v.theSampleOrder");
        console.log('[SampleOrderForm.helper.saveSampleOrderItems] selectedRows', rows);
        console.log('[SampleOrderForm.helper.saveSampleOrderItems] deletedRows', deletedRows);
        try {
            var items = [];
            var productIds = [];
            for(var i = 0; i < rows.length; i++) {
                if (rows[i].quantity == null) { rows[i].quantity = 0; }
                if (rows[i].quantity > 0) {
                    console.log('[SampleOrderForm.helper.saveSampleOrderItems] row', rows[i]);                
                    items.push(rows[i]);
                    productIds.push(rows[i].productId);                    
                }
            }
            var found = false;
            for(var i = 0; i < deletedRows.length; i++) {
                if (productIds.indexOf(deletedRows[i].productId) < 0) {
                    items.push(deletedRows[i]);
                }
            }
            
            console.log('[SampleOrderForm.helper.saveSampleOrderItems] items', items);
           
        var action = component.get("c.saveOrderItems");
        action.setParams({
            "sapId": theSampleOrder.Id,
            "sapItems": JSON.stringify(items)
        });
        action.setCallback(this, function(response) {
            var showToast = false;
            if (component.isValid()) {
                component.set("v.isLoading", false);
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    try {
                        component.set("v.deletedRows", []);

                        var rv = response.getReturnValue();
                        console.log("[SampleOrderForm.helper.saveItems] returnvalue", rv);
                        var productData = component.get("v.productData");
                        for(var i = 0; i < rv.length; i++) {
                            for(var j = 0; j < rows.length; j++) {
                                if (productData[j].productId == rv[i].Product__c) {
                                    productData[j].id = rv[i].Id;
                                    productData[j].quantity = rv[i].Quantity__c;
                                    productData[j].units = productData[j].quantity * productData[j].packQty;
                                    break;
                                }
                                /*
                                if (rv[i].productId == rows[j].productId) {
                                    rows[j].id = rv[i].id; break;
                                }
                                */
                            }
                        }
                        component.set("v.productData", rows); 
                        var theSampleOrder = component.get("v.theSampleOrder");
                        theSampleOrder.SAP_Interfaced_Data_Items__r = rv;
                        component.set("v.theSampleOrder", theSampleOrder);

                        var closeAfterSave = component.get("v.closeAfterSave");
                        console.log('[SampleOrderForm.helper.saveSampleOrder] closeAfterSave', closeAfterSave);
                        if (closeAfterSave) {                            
                            component.set("v.isAddingItems", false);                            
                        }
                            
                    } catch(ex) {
                        console.log('[SampleOrderForm.helper.saveItems] exception', ex.toString());
                    }
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.save] callback returned incomplete.");                    
                    component.set("v.toastTitle", "Error");
                    component.set("v.toastMessage", "Failed to save Sample Order.  The connection may have been interrupted.  Please try again.");
                    component.set("v.isLoading", false);
                    showToast = true;
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    try {
                    console.log("[SampleOrderForm.Helper.save] callback returned in error.", errors);                    
                    component.set("v.toastTitle", "Error");
                    var msg = '';
                    console.log('[SampleOrderForm.Helper.save] error', errors[0]);
                    if (errors[0].fieldErrors && errors[0].fieldErrors.length > 0) {
                        errors[0].fieldErrors.forEach(function(item) {
                            msg += item.message + '\n';
                        });
                    }
                    if (errors[0].pageErrors && errors[0].pageErrors.length > 0) {
                        errors[0].pageErrors.forEach(function(item) {
                            msg += item.message + '\n';
                        });
                    }    
                
                    component.set("v.toastMessage", "Failed to save Sample Order. " + msg);
                    component.set("v.isLoading", false);
                    showToast = true;
                    } catch(ex) {
                        console.log('[SampleOrderForm.helper.save] exception', ex);
                    }
                }
                if (showToast) {
                    var toastPanel = component.find("toastPanel");
                    $A.util.removeClass(toastPanel, "slds-hide");
                }
                
            }
        });
        $A.enqueueAction(action);
        }catch(ex) {
            console.log('[SampleOrderForm.helper.saveItems] exception: ' + ex.toString());
        }
    },
        
    submitOrderForApproval : function(component) {
        component.set("v.isLoading", true);
        var theSampleOrder = component.get("v.theSampleOrder");
        var action = component.get("c.submitForApproval");
        action.setParams({
            "sapId": theSampleOrder.Id
        });
        action.setCallback(this, function(response) {
            var showToast = false;
            if (component.isValid()) {
                component.set("v.isLoading", false);
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    try {
                        component.set("v.closeDialog", true);                        
                    } catch(ex) {
                        console.log('[SampleOrderForm.helper.submitForApproval] exception', ex.toString());
                    }
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.submitForApproval] callback returned incomplete.");                    
                    component.set("v.toastTitle", "Error");
                    component.set("v.toastMessage", "Failed to save Sample Order.  The connection may have been interrupted.  Please try again.");
                    showToast = true;
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.submitForApproval] callback returned in error.", errors);                    
                    component.set("v.toastTitle", "Error");
                    component.set("v.toastMessage", "Failed to save Sample Order. " + errors);
                    showToast = true;
                }
                if (showToast) {
                    var toastPanel = component.find("toastPanel");
                    $A.util.removeClass(toastPanel, "slds-hide");
                }
            }
        });
        $A.enqueueAction(action);            
    }
})