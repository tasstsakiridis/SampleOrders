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
            {'label':'New South Wales', 'value':'NSW'},
            {'label':'Queensland', 'value':'QLD'},
            {'label':'Victoria', 'value':'VIC'},
            {'label':'South Australia', 'value':'SA'},
            {'label':'Western Australia', 'value':'WA'},
            {'label':'Northern Territiry', 'value':'NT'},
            {'label':'Australian Capital Territory', 'value':'ACT'}
        ],    
    },
    countryOptions: [
        {'label': 'Australia', 'value': 'AU'},
    ],
    getProvinceOptions: function(country) {
        console.log('[SampleOrderForm.helper.getProvinceOptions] country', country);
        return this.countryProvinceMap[country];
    },
    getCountryOptions: function() {
        return this.countryOptions;
    },
    
    updateProvinceOptions : function(component) {
        var country = component.get("v.country");
        console.log('[SampleOrderForm.helper.updateProvinceOptions] country', country);
        component.set("v.provinceOptions", this.getProvinceOptions(country));
    },
    doInit : function(component) {
    	this.setupProductColumns(component); 
    },
    setupProductColumns : function(component) {
        component.set("v.productColumns", [
            { label: 'Product', fieldName: 'Name', type:'text' },
            { label: 'Brand', fieldName: 'Brand_Name__c', type: 'text' },
            { label: 'Pack Qty', fieldName: 'Pack_Quantity__c', type: 'number', editable: false },
            { label: 'Quantity', fieldName: 'Quantity__c', type:'number', editable:'true' },
            { label: '# of Bottles', fieldName: 'Units__c', type: 'number', editable: false }
        ]);
        
        var recordId = component.get("v.recordId");
    	var action = component.get("c.getProducts");
        action.setParams({
            sapId: recordId
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
    initSampleOrder : function(component) {
        var theSampleOrder = { 'sObjectType': 'SAP_Interfaced_Data__c', 'Approval_Status__c':'New' };
        console.log('[SampleOrderForm.helper.initSampleOrder] sampleorder', theSampleOrder);
		component.set('v.theSampleOrder', theSampleOrder);  
        component.set("v.disableAddItems", false);
        component.set("v.isAddingItems", false);
        component.set("v.showSelectedProducts", false);
        component.set("v.canSubmit", false);
        component.set("v.orderLocked", false);
        
        this.initToast(component);
        let deletedRows = [];
        component.set("v.deletedRows", deletedRows);
        
        component.set("v.country", "AU");
        component.set("v.businessState", "NSW");
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
    validateOrder : function(component) {
        console.log('[SampleOrderForm.helper.validateOrder]');
    	var theSampleOrder = component.get("v.theSampleOrder");
        var businessState = component.get("v.businessState");
        var country = component.get("v.country");

        if (theSampleOrder.Business_Name__c == null || theSampleOrder.Business_Name__c == '') { console.log('business name is null'); return false; }
        if (theSampleOrder.Requested_Delivery_Date__c == null) { console.log('requested delivery date is null'); return false; }
        if (businessState == null || businessState == '') { console.log('business state is null'); return false; }		 
        if (country == null || country == '') { console.log('country is null');  return false;}
        if (theSampleOrder.Business_Address__c == null || theSampleOrder.Business_Address__c == '') { console.log('shipping street is null');  return false;}
        if (theSampleOrder.Business_City__c == null || theSampleOrder.Business_City__c == '') { console.log('shipping city is null');  return false;}
        if (theSampleOrder.Business_Postcode__c == null || theSampleOrder.Business_Postcode__c == '') { console.log('shipping postcode is null');  return false;}
        if (theSampleOrder.Contact_Name__c == null || theSampleOrder.Contact_Name__c == '') { console.log('contact name is null');  return false;}
        if (theSampleOrder.Contact_Phone__c == null || theSampleOrder.Contact_Phone__c == '') { console.log('contact phone is null');  return false;}
        
        return true;
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
                        component.set("v.classification", rv.Classification__c);
                        component.set("v.country", rv.Business_Country__c == undefined ? 'AU' : rv.Business_Country__c);
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
                                        products[j].units = products[j].quantity * products[j].packQty;
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

        theSampleOrder.Approval_Status__c = 'New';
        theSampleOrder.Business_Country__c = country;
        theSampleOrder.Business_State__c = businessState;
        if (bannerGroup != null && bannerGroup.length > 0) {
            theSampleOrder.Banner_Group__c = bannerGroup;
        }

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
                    showToast = true;
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.save] callback returned in error.", errors);                    
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
                    showToast = true;
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.save] callback returned in error.", errors);                    
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