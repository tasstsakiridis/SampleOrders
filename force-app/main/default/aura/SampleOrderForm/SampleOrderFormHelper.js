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
        TW: [
            {'label': 'Taipei', 'value': 'Taipei'},
            {'label': 'Taiwan', 'value': 'Taiwan'},
            {'label': 'Tainan', 'value': 'Tainan'},
            {'label': 'Taitung', 'value': 'Taitung'}
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
        ],
        MX: [
            {label:'Mexico City', value:'Mexico City'},
        ],
        KR: [
            {label:'Seoul', value:'Seoul'},
        ]
    },
    countryOptions: [
        {'label': 'Australia', 'value': 'AU'},
        {'label': 'United Kingdom', 'value': 'GB' },
        {'label': 'Taiwan', 'value': 'TW' },
        {'label': 'Mexico', 'value': 'MX' },
        {'label': 'Korea', 'value': 'KR' },
    ],

    getProvinceOptions: function(component, country) {
        console.log('[SampleOrderForm.helper.getProvinceOptions] country', country);
        console.log('[SampleOrderForm.helper.getProvinceOptions] states', this.countryProvinceMap[country]);
        console.log('[SampleOrderForm.helper.getProvinceOptions] countryOptions', this.countryOptions);
        try {
            if (country == null || country.length == 0) {
                country = this.getCountryCode(component, component.get('v.userMarket'));
            }
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
    getCountryCode: function(component, name) {
        var countryCode = '';
        for(var i = 0; i < this.countryOptions.length; i++) {
            if (this.countryOptions[i].label == name) {
                countryCode = this.countryOptions[i].value;                
                break;
            }
        }        
        component.set("v.country", countryCode);
        return countryCode;
    },
    
    updateProvinceOptions : function(component) {
        var country = component.get("v.country");
        console.log('[SampleOrderForm.helper.updateProvinceOptions] country', country);                                                        
        if (country == null || country.length == 0) {
            country = this.getCountryCode(component, component.get("v.countryName"));
            console.log('[SampleOrderForm.helper.updateProvinceOptions] country', country);                                                        
        }
        component.set("v.provinceOptions", this.getProvinceOptions(component, country));
        console.log('[SampleOrderForm.helper.updateProvinceOptions] provinceOptions', component.get('v.provinceOptions'));
    },
    getDataTableColumns : function(component) {
        console.log('[SampleOrderForm.helper.getDataTableColumns]');
        const helper = this;
		var action = component.get("c.getObjectDetails");
        action.setCallback(this, function(response) {
            console.log('[SampleOrderForm.helper.getDataTableColums] component valid', component.isValid());
            if (component.isValid()) {
                var callState = response.getState();
                console.log('[SampleOrderForm.helper.getDataTableColumns] callstate', callState);
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrderForm.Helper.getDataTableColumns] object', rv);
                    component.set('v.objectDescribe', rv);
                    console.log('[SampleOrderForm.helper.getDataTableColumns] recordtypes: ', rv.recordTypes);
                    var recordTypes = [];
                    try {
                        const recordTypeId = component.get("v.recordTypeId");
                        
                        for(const rt in rv.recordTypes) {
                            if (rv.recordTypes[rt].label != "Master" && rv.recordTypes[rt].label.indexOf('Locked') < 0) {
                                recordTypes.push(rv.recordTypes[rt]);
                                if (recordTypeId == undefined && rv.recordTypes[rt].isDefault) {
                                    component.set("v.recordTypeName", rv.recordTypes[rt].label);
                                } else if (rv.recordTypes[rt].value == recordTypeId) {
                                    component.set("v.recordTypeName", rv.recordTypes[rt].label);
                                }
                            }
                        }

                        component.set('v.recordTypes', recordTypes);
                        console.log('[SampleOrderForm.helper.getDataTableColumns] # of recordtypes: ' + recordTypes.length);

                        const recordId = component.get("v.recordId");
                        if (recordId == undefined) {
                            helper.getUserDetails(component);
                        } else {
                            helper.loadSampleOrder(component);
                        }

                    }catch(ex) {
                        console.log('exception', ex);                        
                        component.set("v.isLoading", false);
                    }

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
    getUserDetails : function(component) {
        console.log('[SampleOrderForm.helper.getUserDetails]');
        var action = component.get("c.getCurrentUserInfo");
        const helper = this;
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    console.log('[SampleOrderForm.Helper.getUserDetails] user', rv);
                    try {
                        component.set('v.userId', rv.user.Id);
                        component.set('v.userName', rv.user.Name);
                        component.set("v.userPhone", rv.user.MobilePhone);
                        
                        let userRole = rv.user.UserRole == undefined ? '' : rv.user.UserRole.Name;
                        component.set('v.userRole', userRole);
                        
                        const recordTypeName = component.get("v.recordTypeName");

                        let theSampleOrder = component.get("v.theSampleOrder");
                        let isStoreroomRequest = false;
                        let useStandardAddressComponent = rv.market.Standard_Address_Input__c == undefined ? false : rv.market.Standard_Address_Input__c;
                        let showInternationalOrder = rv.market.Allow_International_Orders__c == undefined ? false : rv.market.Allow_International_Orders__c;
                        let showInternalOrderNumbers = rv.market.Internal_Order_Numbers__c == undefined ? false : rv.market.Internal_Order_Numbers__c;
                        let showActivities = rv.market.Activities__c == undefined ? false : rv.market.Activities__c;
                        let showAccounts = rv.market.Accounts__c == undefined ? false : rv.market.Accounts__c;
                        let showStorageLockers = rv.market.Storage_Lockers__c == undefined ? false : rv.market.Storage_Lockers__c;
                        let showWholesalers = rv.market.Show_Wholesalers__c == undefined ? false : rv.market.Show_Wholesalers__c;

                        if (recordTypeName == 'Sample Order - Storeroom Request') {
                            isStoreroomRequest = true;
                            useStandardAddressComponent = false;
                            theSampleOrder.Contact_Name__c = rv.user.Name;
                            theSampleOrder.Contact_Phone__c = rv.user.MobilePhone;
                            showInternationalOrder = false;
                        } 

                        let country = rv.market.Country_ISO_Code_2__c;
                        let countryName = rv.market.Name;
                        if (theSampleOrder.Market__c != undefined) {
                            country = theSampleOrder.Market__r.Country_ISO_Code_2__c;
                            countryName = theSampleOrder.Market__r.Name;
                        }
                        component.set("v.marketId", rv.market.Id);
                        component.set('v.userMarket', rv.market.Name);
                        component.set('v.country', country);
                        component.set("v.countryName", countryName);
                        helper.updateProvinceOptions(component);

                        component.set('v.leadTime', rv.market == undefined || rv.market.Sample_Order_Lead_Time__c == undefined ? 0 : parseInt(rv.market.Sample_Order_Lead_Time__c));
                        component.set("v.showInternationalOrder", showInternationalOrder);
                        component.set("v.showAccounts", showAccounts);
                        component.set("v.showWholesalers", showWholesalers);
                        component.set("v.showStorageLockers", showStorageLockers);
                        component.set("v.showActivities", showActivities);
                        component.set("v.showCostCenters", rv.market.Cost_Centers__c == undefined ? false : rv.market.Cost_Centers__c);
                        component.set("v.showInternalOrderNumbers", showInternalOrderNumbers);
                        component.set("v.showShippingInstructions", rv.market.Shipping_Instructions__c == undefined ? false : rv.market.Shipping_Instructions__c);
                        component.set("v.useStandardAddressComponent", useStandardAddressComponent);
                        component.set("v.captureVolumeInBottles", rv.market.Capture_Volume_in_Bottles__c == undefined ? false : rv.market.Capture_Volume_in_Bottles__c);
                        component.set("v.showPrice", rv.market.Show_Product_Price__c == undefined ? false : rv.market.Show_Product_Price__c);
                        component.set("v.showCaseConversion", rv.market.Capture_Volume_in_Bottles__c == undefined ? false : rv.market.Capture_Volume_in_Bottles__c);
                        component.set("v.showRemainingQty", showActivities);
                        component.set("v.showStatusInput", rv.market.Allow_Status_Change__c == undefined ? false : rv.market.Allow_Status_Change__c);
                        component.set("v.showSubmitForApproval", rv.market.Submit_Order_for_Approval__c == undefined ? false : rv.market.Submit_Order_for_Approval__c);
                        component.set("v.isStoreroomRequest", isStoreroomRequest);

                        console.log("[SampleOrderForm.helper.getUserDetails] captureVolumeInBottles", component.get("v.captureVolumeInBottles"));
                        let lockStatusInput = !((userRole == 'Global Administrator' || userRole == 'TWN_Supplier Chain Manager') && theSampleOrder.Approval_Status__c == 'Approved');
                        component.set("v.lockStatusInput", lockStatusInput);

                        console.log('[SampleOrderForm.helper.getUserDetails] user', rv.user);
                        console.log('[SampleOrderForm.helper.getUserDetails] market', rv.market);

                        helper.updateProvinceOptions(component);
                        helper.setupProductColumns(component);

                        if (rv.market.Name == 'Australia') {
                            helper.getBannerGroups(component);
                        }
                        console.log('[SampleOrderForm.helper.getUserDetails] showAccounts', showAccounts);
                        if (showAccounts) {
                            let accountFilter = "WHERE Is_Active__c=true AND Market__c = '"+rv.market.Id+"'";
                            accountFilter += " AND RecordType.Name = '"+rv.market.Sample_Order_Account_RecordType__c+"'";
                            component.set("v.accountFilter", accountFilter);
                        }
                        if (showWholesalers) {
                            let wholesalerFilter = "WHERE Is_Active__c = true AND Market__c ='"+rv.market.Id+"'";
                            wholesalerFilter += " AND RecordType.Name = '"+rv.market.Sample_Order_Wholesaler_RecordType__c+"'";
                            component.set("v.wholesalerFilter", wholesalerFilter);
                        }
                        if (showStorageLockers) {
                            helper.getStorageLockers(component);
                        }
                        if (showInternalOrderNumbers) {
                            helper.getInternalOrderNumbers(component);
                        }
                        if (isStoreroomRequest) {
                            helper.getStorerooms(component);
                        }
                        if (showActivities) {
                            helper.getPromotionActivities(component);
                        }
                        helper.getPicklistValuesForRecordType(component);
                    }catch(ex) {
                        console.log('[SampleOrderForm.helper.getUserDetails] exception', ex);
                    }
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getUserDetails] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getUserDetails] callback returned in error.", errors);                    
                }
            }
        });
        $A.enqueueAction(action);
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
                        component.set("v.allPicklistValues", rv);

                        let approvalStatus = component.get("v.approvalStatus");
                        let classification = component.get("v.classification");
                        let costCenter = component.get("v.costCenter");
                        let statuses = component.get("v.statuses");
                        let reasonCode = component.get("v.reasonCode");
                        let orderStatus = component.get("v.orderStatus");

                        var classifications = [{"label":"", "value":""}];
                        var costCenters = [{"label":"", "value":""}];
                        var reasonCodes = [{"label":"", "value":""}];
                        var orderStatuses = [{"label":"", "value":""}];
                        var stickerTypes = [];                     

                        var classificationPicklistValues = rv["Classification__c"].picklistValues;
                        var costCentersPicklistValues = rv["Cost_Center__c"].picklistValues;
                        var statusPicklistValues = rv["Approval_Status__c"].picklistValues;
                        var orderStatusPicklistValues = rv["Order_Status__c"].picklistValues;
                        const reasonCodePicklistValues = rv["Reason_Code__c"] == undefined ? [] : rv["Reason_Code__c"].picklistValues;
                        const stickerTypePicklistValues = rv["Sticker_Type__c"] == undefined ? [] : rv["Sticker_Type__c"].picklistValues;
                        //const reasonCodePicklistValues = rv["Reason_Code__c"].picklistValues;
                        console.log('[SampleOrderForm.Helper.getPicklistValues] classificationPicklistValues', classificationPicklistValues);
                        console.log('[SampleOrderForm.Helper.getPicklistValues] costCentersPicklistValues', costCentersPicklistValues);
                        console.log('[SampleOrderForm.Helper.getPicklistValues] statusPicklistValues', statusPicklistValues);
                        console.log('[SampleOrderForm.Helper.getPicklistValues] orderStatuses', orderStatusPicklistValues);
                        console.log('[SampleOrderForm.helper.getPicklistValues] stickerTypePicklistValues', stickerTypePicklistValues);

                        for(var i = 0; i < statusPicklistValues.length; i++) {
                            statuses.push({"label":statusPicklistValues[i].label, "value":statusPicklistValues[i].value, "selected":statusPicklistValues[i].value==approvalStatus});
                        }
                        console.log('[SampleOrderForm.Helper.getPicklistValues] statuses', statuses);
                        
                        for(var i = 0; i < classificationPicklistValues.length; i++) {
                            classifications.push({"label":classificationPicklistValues[i].label, "value":classificationPicklistValues[i].value, "selected":classificationPicklistValues[i].value==classification});
                        }
                        console.log('[SampleOrderForm.Helper.getPicklistValues] classification', classifications);
                        
                        for(var i = 0; i < costCentersPicklistValues.length; i++) {
                            costCenters.push({"label":costCentersPicklistValues[i].label, "value":costCentersPicklistValues[i].value, "selected":costCentersPicklistValues[i].value==costCenter});
                        }
                        console.log('[SampleOrderForm.Helper.getPicklistValues] costCenters', costCenters);
                        
                        if (classification && classification.length > 0) {
                            const classificationPicklistValues = reasonCodePicklistValues.filter(r => r.description == classification);
                            for(var i = 0; i < classificationPicklistValues.length; i++) {
                                reasonCodes.push({"label":classificationPicklistValues[i].label, "value":classificationPicklistValues[i].value, "selected":classificationPicklistValues[i].value==reasonCode});
                            }
    
                        }
                        
                        if (orderStatusPicklistValues && orderStatusPicklistValues.length > 0) {
                            for(var i = 0; i < orderStatusPicklistValues.length; i++) {
                                orderStatuses.push({"label":orderStatusPicklistValues[i].label, "value":orderStatusPicklistValues[i].value, "selected":orderStatusPicklistValues[i].value==orderStatus});
                            }                            
                        }

                        console.log('[SampleOrderForm.Helper.getPicklistValues] classification', classifications);
                        console.log('[SampleOrderForm.Helper.getPicklistValues] costCenters', costCenters);
                        console.log('[SampleOrderForm.Helper.getPicklistValues] statuses', statuses);
                        console.log('[SampleOrderForm.Helper.getPicklistValues] orderStatuses', orderStatuses);
                    
                        if (stickerTypePicklistValues && stickerTypePicklistValues.length > 0) {
                            component.set("v.stickerTypes", stickerTypePicklistValues);
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
                        reasonCodes.sort(function(a, b) {
                            let x = a.label.toLowerCase();
                            let y = b.label.toLowerCase();
                            if (x < y) { return -1; }
                            if (x > y) { return 1; }
                            return 0; 
                        });
                        orderStatuses.sort(function(a, b) {
                            let x = a.label.toLowerCase();
                            let y = b.label.toLowerCase();
                            if (x < y) { return -1; }
                            if (x > y) { return 1; }
                            return 0; 
                        });
                    
                        for(var i = 0; i < statuses.length; i++) {
                            if (statuses[i].value == approvalStatus) {
                                approvalStatus = statuses[i].label;
                                break;
                            }
                        }
                        component.set("v.approvalStatus", approvalStatus);

                        console.log('[SampleOrderForm.helper.getPicklistValues] classifications', classifications);
                        console.log('[SampleOrderForm.helper.getPicklistValues] cost centers', costCenters);
                        component.set("v.classifications", classifications);
                        component.set("v.costCenters", costCenters);
                        component.set("v.statuses", statuses);
                        component.set("v.reasonCodes", reasonCodes);
                        component.set("v.orderStatuses", orderStatuses);
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
        let lblProduct = $A.get('$Label.c.Product');
        let lblSKU = $A.get('$Label.c.SKU');
        let lblBrand = $A.get('$Label.c.Brand');
        let lblInternalOrderNumber = $A.get('$Label.c.InternalOrderNumber');
        let lblPackQty = $A.get('$Label.c.PackQty');
        let lblPrice = $A.get('$Label.c.Price');
        let lblQuantity = $A.get('$Label.c.Quantity');
        let lblRemaining = $A.get('$Label.c.Remaining');
        let lblNumberOfBottles = $A.get('$Label.c.NumberOfBottles');
        let lblConvertedCases = $A.get('$Label.c.ConvertedCases');
        console.log('[setupProductTableHeaders] showCaseConversion', component.get("v.showCaseConversion"));
        component.set("v.productColumns", [
            { label: lblProduct, fieldName: 'Name', type:'text', isVisible: true },
            { label: lblSKU, fieldName: 'ProductCode__c', type: 'text', isVisible: component.get("v.showSKU")},
            { label: lblBrand, fieldName: 'Brand_Name__c', type: 'text', isVisible: true },
            { label: lblInternalOrderNumber, fieldName: 'Internal_Order_Number__c', type: 'text', isVisible: component.get("v.showInternalOrderNumbers")},
            { label: lblPackQty, fieldName: 'Pack_Quantity__c', type: 'number', editable: false, isVisible: true },
            { label: lblPrice, fieldName: 'Price__c', type:'number', editable: false, isVisible: component.get("v.showPrice") },
            { label: lblRemaining, fieldName: 'Total_Actual_Free_Bottle_Qty__c', type:'number', editable: false, isVisible: component.get("v.showRemainingQty") },
            { label: lblQuantity, fieldName: 'Quantity__c', type:'number', editable:'true', isVisible: true },
            { label: lblNumberOfBottles, fieldName: 'Units__c', type: 'number', editable: false , isVisible: component.get("v.showCaseConversion")==false},
            { label: lblConvertedCases, fieldName: 'Total_Ordered_Cases__c', type: 'text', editable: false, isVisible: component.get("v.showCaseConversion") }
        ]);        
    },
    setupProductColumns : function(component) {
        this.setupProductTableHeaders(component);

        const recordTypeName = component.get("v.recordTypeName");
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
                    console.log('[SampleOrderForm.helper.getProducts] data', rv);
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
        console.log('[SampleOrderForm.helper.getBannerGroups]');

        var action = component.get("c.getBannerGroups");
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    const theSampleOrder = component.get("v.theSampleOrder");
                    const selectedBannerGroup = theSampleOrder.Banner_Group__c;

                    var rv = response.getReturnValue();
                    console.log('[SampleOrderForm.Helper.getBannerGroups] bannergroups', rv);
                    var banners = [{"label":"", value:""}];
                    for(var i = 0; i < rv.length; i++) {
                        banners.push({"label":rv[i].Name,"value":rv[i].Id, "selected":rv[i].Id==selectedBannerGroup});
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
        console.log('[SampleOrderForm.helper.getAccounts]');

        const marketId = component.get("v.marketId");
    	var action = component.get("c.getStorageLockers");
        action.setParams({
            marketId : marketId
        });
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    const theSampleOrder = component.get("v.theSampleOrder");
                    const storageLocker = theSampleOrder.Storage_Locker__c;

                    var rv = response.getReturnValue();
                    console.log('[SampleOrderForm.Helper.getStorageLockers] lockers', rv);
                    var lockers = [{"label":"", value:""}];
                    for(var i = 0; i < rv.length; i++) {
                        lockers.push({"label":rv[i].Name + '-' + rv[i].ShippingCity,"value":rv[i].Id, "selected":rv[i].Id==storageLocker, account: rv[i]});
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
    getStorerooms : function(component) {
        console.log('[SampleOrderForm.helper.getStorerooms]');

        var action = component.get("c.getStorerooms");
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    try {
                        const theSampleOrder = component.get("v.theSampleOrder");
                        const storeroom = theSampleOrder.Account__c;
                        var rv = response.getReturnValue();
                        console.log('[SampleOrderForm.Helper.getStorerooms] storerooms', rv);
                        var rooms = [{"label":"", value:""}];
                        var owners = {};
                        for(var i = 0; i < rv.length; i++) {
                            rooms.push({"label":rv[i].account.Name + '-' + rv[i].account.ShippingCity,"value":rv[i].account.Id, "selected":rv[i].account.Id==storeroom, account: rv[i].account});
                            if (rv[i].owners != undefined) {
                                let ownerList = [];
                                for(var j = 0; j < rv[i].owners.length; j++) {
                                    ownerList.push({
                                        'type': 'avatar',
                                        'href': '',
                                        'label': rv[i].owners[j].Name,
                                        'src'  : rv[i].owners[j].SmallPhotoUrl,
                                        'fallbackIconName': 'standard:user',
                                        'variant': 'circle',
                                        'alternativeText': rv[i].owners[j].Name
                                    });
                                }
        
                                owners[rv[i].account.Id] = ownerList;
                            }
                        }
                        rooms.sort(function(a, b) { 
                            let x = a.label.toLowerCase();
                            let y = b.label.toLowerCase();
                            if (x < y) { return -1; }
                            if (x > y) { return 1; }
                            return 0; 
                        });
                        console.log('[SampleOrderForm.helper.getStorerooms] storerooms', rooms);
                        console.log('[SampleOrderForm.helper.getStorerooms] owners', owners);
                        component.set("v.storerooms", rooms);
                        component.set("v.storeroomOwnersMap", owners);
                        //component.set("v.showStorerooms", rooms.length > 1);
                    }catch(ex) {
                        console.log('[SampleOrderForm.helper.getStorerooms] exception', ex);
                    }
                                        
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getStorerooms] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getStorerooms] callback returned in error.", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
    },
    getInternalOrderNumbers : function(component) {
        console.log('[SampleOrderForm.helper.getInternalOrderNumbers]');

        var action = component.get("c.getInternalOrderNumbers");
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    //component.set("v.internalOrderNumbers", rv);
                    
                    console.log('[SampleOrderForm.Helper.getInternalOrderNumbers] ordernumbers', rv);
                    var ionumberMap = new Map();
                    var ionumbers;
                    for(var i = 0; i < rv.length; i++) {
                        if (ionumberMap.has(rv[i].Brand__c)) {
                            ionumbers = ionumberMap.get(rv[i].Brand__c); 
                        } else {
                            ionumbers = [{"label":"", "value":""}];
                        }

                        ionumbers.push({"label":rv[i].Description__c + ' ' + rv[i].Internal_Order_Number__c, "value":rv[i].Internal_Order_Number__c});
                        ionumberMap.set(rv[i].Brand__c, ionumbers);
                    }
                    console.log('[SampleOrderForm.helper.getInternalOrderNumbers] ionumbersmap', ionumberMap);
                    component.set("v.internalOrderNumbers", ionumberMap);
                    
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getInternalOrderNumbers] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getInternalOrderNumbers] callback returned in error.", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
    },
    getAccountDetails : function(component, accountId) {
        console.log('[SampleOrderForm.helper.getAccountDetails]');

        var action = component.get("c.getAccountDetails");
        action.setParams({
            accountId: accountId
        });
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    var rv = response.getReturnValue();
                    
                    console.log('[SampleOrderForm.Helper.getAccountDetails] returnValue', rv);
                    console.log('[SampleOrderForm.Helper.getAccountDetails] returnValue length', rv.length);
                    var theSampleOrder = component.get('v.theSampleOrder');
                    try {
                        if (rv.length > 0) {
                            theSampleOrder.Business_Name__c = rv[0].Name;
                            theSampleOrder.Business_Address__c = rv[0].ShippingStreet;
                            theSampleOrder.Business_City__c = rv[0].ShippingCity;
                            theSampleOrder.Business_Country__c = rv[0].ShippingCountry;
                            theSampleOrder.Business_Postcode__c = rv[0].ShippingPostalCode;
                            
                            var countryCode = '';
                            for(var i = 0; i < this.countryOptions.length; i++) {
                                if (this.countryOptions[i].label == rv[0].ShippingCountry) {
                                    countryCode = this.countryOptions[i].value; break;
                                }
                            }
                            component.set("v.country", countryCode);
                            component.set("v.countyName", rv[0].ShippingCountry);                            
                            component.set("v.businessState", rv[0].ShippingState);                        

                            if (rv[0].Contacts != null && rv[0].Contacts.length > 0) {
                                theSampleOrder.Contact_Name__c = rv[0].Contacts[0].Name;
                                theSampleOrder.Contact_Phone__c = rv[0].Contacts[0].Phone == null || rv[0].Contacts[0].Phone == '' ? rv[0].Contacts[0].MobilePhone : rv[0].Contacts[0].Phone;    
                            }
        
                            component.set("v.theSampleOrder", theSampleOrder); 
                            console.log('[SampleOrderForm.helper.getAccountDetails] theSampleOrder', theSampleOrder);   
                            console.log('[SampleOrderForm.helper.getAccountDetails] countryCode', countryCode);
                        }
                    }catch(ex) {
                        console.log('[SampleOrderForm.helper.getAccountDetails] exception', ex);
                    }
                        
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getAccountDetails] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getAccountDetails] callback returned in error.", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
    },
    getPromotionActivities : function(component) {
        console.log('[SampleOrderForm.helper.getPromotionActivities]');
        
        var action = component.get("c.getPromotionActivities");
        action.setParams({
            'activityType' : 'MX - PSA'
        });
        action.setCallback(this, function(response) {
            if (component.isValid()) {
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    const theSampleOrder = component.get("v.theSampleOrder");
                    const activity = theSampleOrder.Activity__c;

                    var rv = response.getReturnValue();
                    console.log('[SampleOrderForm.Helper.getPromotionActivities] activities', rv);

                    var activities = [{"label":"", value:""}];
                    for(var i = 0; i < rv.length; i++) {
                        activities.push({"label":rv[i].Name,"value":rv[i].Id, activity: rv[i], "selected":rv[i].Id==activity});
                    }
                    activities.sort(function(a, b) { 
                        let x = a.label.toLowerCase();
                        let y = b.label.toLowerCase();
                        if (x < y) { return -1; }
                        if (x > y) { return 1; }
                        return 0; 
                    });
                    console.log('[SampleOrderForm.helper.getPromotionActivities] activities', activities);
                    component.set("v.activities", activities);                    
                    
                } else if (callState === "INCOMPLETE") {
                    console.log("[SampleOrderForm.Helper.getPromotionActivities] callback returned incomplete.");                    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log("[SampleOrderForm.Helper.getPromotionActivities] callback returned in error.", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
    },

    initSampleOrder : function(component) {
        let recordTypeName = component.get("v.recordTypeName");
        var userName = component.get("v.userName");
        var userPhone = component.get("v.userPhone");
        console.log('userName', userName);
        console.log('userPhone', userPhone);
        var contactName = '';
        var contactPhone = '';
        if (recordTypeName == 'Sample Order - Storeroom Request') {
            contactName = userName;
            contactPhone = userPhone;
        } 

        var theSampleOrder = { 'sObjectType': 'SAP_Interfaced_Data__c', 
                               'Approval_Status__c':'New',
                              'Business_Country__c': component.get("v.countryName"),
                              'Contact_Name__c' : contactName,
                              'Contact_Phone__c' : contactPhone};
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
        component.set("v.showInternalOrderNumbers", false);
        component.set("v.accountId", null);
        component.set("v.accountName", null);
        component.set("v.wholesalerId", null);
        component.set("v.wholesalerName", null);
        component.set("v.storeroom", null);
        component.set("v.promotionActivity", null);
        component.set("v.showStatusInput", false);
        component.set("v.lockStatusInput", false);
        component.set("v.approvalStatus", theSampleOrder.Approval_Status__c);
        component.set("v.canSave", true);
        component.set("v.storeroomOwners", null);
        
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
                rows[i].internalOrderNumber = '';
                rows[i].convertedCases = '';
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
            const theSampleOrder = component.get("v.theSampleOrder");
            var navService = component.find("navService");
            var pageReference;
            if (theSampleOrder.Id == undefined) {
                pageReference = {
                    type: 'standard__objectPage',
                    attributes: {
                        objectApiName: 'SAP_Interfaced_Data__c',
                        actionName: 'home'
                    }
                };
            } else {
                pageReference = {
                    type: 'standard__recordPage',
                    attributes: {
                        objectApiName: 'SAP_Interfaced_Data__c',
                        actionName: 'view',
                        recordId: theSampleOrder.Id
                    }
                };
            }
            navService.navigate(pageReference);        
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
    filterProductsToActivityProducts : function(component) {
        const activityId = component.get("v.promotionActivity");
        console.log('[filterProductsToActivityProducts] activityId', activityId);
        const activities = component.get("v.activities");
        console.log('[filterProductsToActivityProducts] activities', activities);
        const activityRecord = activities.find(a => a.value == activityId);
        if (activityRecord == undefined) { return; }
        
        const activity = activityRecord.activity;
        console.log('[filterProductsToActivityProducts] activity', activity);
        const allProducts = component.get("v.productData");
        console.log('[filterProductsToActivityProducts] allProducts', allProducts);
        
        let activityProducts = activity.Promotion_Material_Items__r;
        console.log('[filterProductsToActivityProducts] activityProducts', activityProducts);
        let products = [];
        allProducts.forEach(p => {
            const ap = activityProducts.find(pmi => pmi.Product_Custom__c == p.productId);
            if (ap != undefined) {
                console.log('[filterProductsToActivityProducts] p', p);
                
                products.push({
                    brandId : p.brandId,
                    brandName : p.brandName,
                    productId : p.productId,
                    productName: p.productName,
                    cogs: p.cogs,
                    convertedCases: p.convertedCases,
                    id: p.id,
                    internalOrderNumber : p.internalOrderNumber,
                    packQty : p.packQty,
                    price: p.price,
                    quantity : p.quantity,
                    units : p.units,
                    usedFor : p.usedFor,
                    totalActualQty : ap.Total_Actual_Free_Bottle_Qty__c,
                    totalPlannedQty : ap.Free_Bottle_Quantity__c,
                    remainingFreeBottleQty: ap.Free_Bottle_Quantity__c - ap.Total_Actual_Free_Bottle_Qty__c
                });
            }
        });
        console.log('[filterProductsToActivityProducts] products', products);
        component.set("v.data", products);
        component.set("v.productData", products);
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
    showStoreroomOwners : function(component) {
        var storeroom = component.get("v.accountId");
        var ownersMap = component.get("v.storeroomOwnersMap");
        let owners = ownersMap[storeroom];
        console.log('[SampleOrderForm.helper.showStoreroomOwners] storeroom', storeroom);
        console.log('[SampleOrderForm.helper.showStoreroomOwners] ownersMap', ownersMap);
        console.log('[SampleOrderForm.helper.showStoreroomOwners] owners', owners);
        component.set("v.storeroomOwners", owners);
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
    setBusinessDetailsFromStoreroom : function(component) {
        let storeroom = component.get("v.accountId");
        let storerooms = component.get("v.storerooms");
        var theSampleOrder = component.get("v.theSampleOrder");
        if (storeroom == '') {
            theSampleOrder.Business_Name__c = '';
            theSampleOrder.Business_Address__c = '';
            theSampleOrder.Business_City__c = '';
            theSampleOrder.Business_Postcode__c = '';
            theSampleOrder.Business_State__c = '';

            component.set("v.theSampleOrder", theSampleOrder);
            component.set("v.businessState", '');
        } else {
            if (storerooms != null && storerooms.length > 0) {
                let room = storerooms.find(r => r.value == storeroom);
                if (room != undefined) {
                    theSampleOrder.Business_Name__c = room.account.Name;
                    theSampleOrder.Business_Address__c = room.account.ShippingStreet;
                    theSampleOrder.Business_City__c = room.account.ShippingCity;
                    theSampleOrder.Business_Postcode__c = room.account.ShippingPostalCode;
                    theSampleOrder.Business_Country__c = room.account.ShippingCountry;

                    component.set("v.theSampleOrder", theSampleOrder);
                    component.set("v.businessState", room.account.ShippingState);
                }
            }
        }
    },
    setBusinessDetailsFromActivity : function(component) {
        let activity = component.get("v.promotionActivity");
        let activities = component.get("v.activities");
        var theSampleOrder = component.get("v.theSampleOrder");
        if (activity == '') {
            theSampleOrder.Business_Name__c = '';
            theSampleOrder.Business_Address__c = '';
            theSampleOrder.Business_City__c = '';
            theSampleOrder.Business_Postcode__c = '';
            theSampleOrder.Business_State__c = '';

            component.set("v.theSampleOrder", theSampleOrder);
            component.set("v.businessState", '');
        } else {
            if (activities != null && activities.length > 0) {
                let pa = activities.find(r => r.value == activity);
                if (pa != undefined) {
                    theSampleOrder.Business_Name__c = pa.activity.Account__r.Name;
                    theSampleOrder.Business_Address__c = pa.activity.Account__r.ShippingStreet,
                    theSampleOrder.Business_City__c = pa.activity.Account__r.ShippingCity;
                    theSampleOrder.Business_Postcode__c = pa.activity.Account__r.ShippingPostalCode;
                    theSampleOrder.Contact_Name__c = pa.activity.Contact__r.Name;
                    theSampleOrder.Contact_Phone__c = pa.activity.Contact__r.Phone;

                    component.set("v.theSampleOrder", theSampleOrder);
                    component.set("v.businessState", pa.Account.ShippingState);
                }
            }
        }
    },
    validateOrder : function(component) {
        console.log('[SampleOrderForm.helper.validateOrder]');
    	var theSampleOrder = component.get("v.theSampleOrder");
        var businessState = component.get("v.businessState");
        var country = component.get("v.countryName");
        let classification = component.get("v.classification");
        let costCenter = component.get("v.costCenter");
        let leadTime = component.get("v.leadTime");
        console.log('[validateOrder] leadTime', leadTime);
        let userMarket = component.get("v.userMarket");
        let countryCode = this.getCountryCode(component, userMarket);
        let storeroom = component.get("v.storeroom");
        
        console.log('[validateOrder] userMarket', userMarket);
        console.log('[validateOrder] countryCode', countryCode);
        let isValid = true;
        let requiredFieldMissing = false;
        let msg = '';
        let today = new Date();

        if (classification == null || classification == '') { 
            console.log('classification is null'); 
            //msg += 'Classification is required';
            requiredFieldMissing = true;
            isValid = false; 
        }
        if (theSampleOrder.Business_Name__c == null || theSampleOrder.Business_Name__c == '') { 
            console.log('business name is null'); 
            //msg += '\nBusiness Name is required';
            requiredFieldMissing = true;
            isValid = false;; 
        } else {
            if (theSampleOrder.Business_Name__c.length > 25) {
                msg += 'Business Name is too long.  Max 25 characters';
                isValid = false;
            }
        }
        if (theSampleOrder.Requested_Delivery_Date__c == null) { 
            console.log('requested delivery date is null'); 
            //msg += 'Requested Delivery Date is requied';
            requiredFieldMissing = true;
            isValid = false; 
        } else {
            if (leadTime != null && leadTime > 0) {
                let daysDiff = Math.floor((new Date(theSampleOrder.Requested_Delivery_Date__c).getTime() - today.getTime()) / (1000 * 3600 * 24));
                console.log('[validateOrder] daysDiff', daysDiff);
                if (daysDiff < leadTime) {
                    console.log('requested delivery date is within lead time');
                    msg += 'Requested Delivery Date is within the lead time for your market. Please extend the Requested Delivery Date.';
                    isValid = false;
                }
            }
        }
        if (country == null || country == '') { 
            console.log('country is null');  
            isValid = false;
        } else { 
        }
        if (theSampleOrder.Business_Address__c == null || theSampleOrder.Business_Address__c == '') { 
            console.log('shipping street is null');  
            requiredFieldMissing = true;
            isValid = false;
        } else {
            if (theSampleOrder.Business_Address__c.length > 35) {
                msg += 'Business Address is too long.  Max 35 characters';
                isValid = false;
            }
        }
        if (theSampleOrder.Business_City__c == null || theSampleOrder.Business_City__c == '') { 
            console.log('shipping city is null');  
            requiredFieldMissing = true;
            isValid = false;
        } else {
            if (theSampleOrder.Business_City__c.length > 35) {
                msg += 'Business City is too long.  Max 35 characters';
                isValid = false;
            }
        }
        if (theSampleOrder.Business_Postcode__c == null || theSampleOrder.Business_Postcode__c == '') { 
            console.log('shipping postcode is null');  
            requiredFieldMissing = true;
            isValid = false;
        } else {
            if (theSampleOrder.Business_Postcode__c.length > 9) {
                msg += 'Business PostCode is too long.  Max 9 characters';
                isValid = false;
            }
        }
        if (theSampleOrder.Business_Country__c == null || theSampleOrder.Business_Country__c == '') {
            requiredFieldMissing = true;
            isValid = false;
        }
        const useStandardAddressComponent = component.get("v.useStandardAddressComponent");
        if (useStandardAddressComponent && !theSampleOrder.Is_International_Order__c) {
            if (businessState == null || businessState == '') { 
                console.log('business state is null'); 
                //msg += 'Business State is required';
                requiredFieldMissing = true;
                isValid = false; 
            } else {
                
            }		 
        }

        if (theSampleOrder.Contact_Name__c == null || theSampleOrder.Contact_Name__c == '') { 
            console.log('contact name is null');  
            //msg += 'Contact Name is required<br />';
            requiredFieldMissing = true;
            isValid = false;
        } else {
            if (theSampleOrder.Contact_Name__c.length > 70) {
                msg += 'Contact Name is too long.  Max 70 characters.';
                isValid = false;
            }
        }
        if (theSampleOrder.Contact_Phone__c == null || theSampleOrder.Contact_Phone__c == '') { 
            console.log('contact phone is null');  
            //msg += 'Contact Phone is required<br />';
            requiredFieldMissing = true;
            isValid = false;
        }
        if (theSampleOrder.Reason__c == null || theSampleOrder.Reason__c == '') { 
            console.log('Reason is null');  
            //msg += 'You must enter a Reason.';
            requiredFieldMissing = true;
            isValid = false;
        }
        
        if ((countryCode == 'GB' && classification != null && classification.indexOf('SD0') == -1) || countryCode == 'KR') {
            if (costCenter == null || costCenter == '') { 
                console.log('cost center is null'); 
                //msg += 'You must select a cost center.';
                requiredFieldMissing = true;
                isValid = false; 
            }
        }
        if (theSampleOrder.Is_Gift__c == true && (theSampleOrder.Gift_Register_Acknowledgement__c == null || theSampleOrder.Gift_Register_Acknowledgement__c == false)) {
            console.log('gift hasnt been acknowledged');
            msg += 'You must acknowledge that you have completed the gift register for this gift';
            isValid = false;
        }
        if (requiredFieldMissing) {
            msg += component.get("v.requiredFieldMissingMessage");
        }
        return { msg: msg, isValid: isValid };
    },
    loadSampleOrder : function(component) {
        component.set("v.isLoading", true);
        const helper = this;
        const recordId = component.get("v.recordId");

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
                        component.set("v.reasonCode", rv.Reason_Code__c);
                        component.set("v.accountId", rv.Account__c);
                        component.set("v.wholesalerId", rv.Wholesaler__c);
                        component.set("v.promotionActivity", rv.Activity__c);
                        component.set("v.orderStatus", rv.Order_Status__c);

                        helper.getUserDetails(component);

                        const market = component.get("v.userMarket");
                        if (market == 'Australia' && rv.Account__c != undefined && rv.Account__c != '') {
	                        let storeroomOwnersMap = component.get("v.storeroomOwnersMap");
    						const owners = storeroomOwnersMap[rv.Account__c];
                            component.set('v.storeroomOwners', owners);
                        } 

                        /*
                        let orderStatuses = component.get("v.orderStatuses");
                        if (orderStatuses != null) {
                            for(var i = 0; i < orderStatuses.length; i++) {
                                orderStatuses[i].selected = false;
                                if (orderStatuses[i].value == rv.Order_Status__c) {
                                    orderStatuses[i].selected = true;
                                }
                            }
                        }
                        component.set("v.orderStatuses", orderStatuses);
                        */

                        var approvalStatus = rv.Approval_Status__c;
                        var statuses = component.get("v.statuses");
                        if (statuses && statuses.length > 0) {
                            for (var i = 0; i < statuses.length; i++) {
                                if (statuses[i].value == approvalStatus) {
                                    approvalStatus = statuses[i].label;
                                    break;
                                }
                            }
                        }
                        component.set("v.approvalStatus", approvalStatus);

                        let disableButtons = rv.Approval_Status__c != 'New';
                        let userRole = component.get('v.userRole');
                        let country = component.get("v.country");

                        let showCostCenter = false;
                        let showInternalOrderNumbers = false;
                        let showStatusInput = false;
                        let lockStatusInput = false;
                        if (country == 'GB') {
                            if (rv.Classification__c.indexOf('SD0') < 0) {
                                showCostCenter = true;
                            } else {
                                showInternalOrderNumbers = true;
                            }   
                        }
                        if (country == 'TW') {
                            showStatusInput = true;
                            showCostCenter = true;
                            lockStatusInput = !((userRole == 'Global Administrator' || userRole == 'TWN-Supply Chain Manager') && rv.Is_Approved__c == true);
                            disableButtons = lockStatusInput;
                        }
                    
                        console.log('showInternalOrderNumbers', showInternalOrderNumbers);
                        console.log('showCostCenters', showCostCenter);
                        console.log('lockStatusInput', lockStatusInput);
                        console.log('disableButtons', disableButtons);
                        component.set("v.showCostCenters", showCostCenter);
                        component.set("v.costCenter", rv.Cost_Center__c);
                        component.set("v.showInternalOrderNumbers", showInternalOrderNumbers);
                        component.set("v.showStatusInput", showStatusInput);
                        component.set("v.lockStatusInput", lockStatusInput);
                        component.set("v.disableButtons", disableButtons);

                        component.set("v.storageLocker", rv.Storage_Locker__c)
                        component.set("v.storeroom", rv.Account__c);

                        let countryCode = rv.Business_Country__c == undefined ? 'AU' : rv.Business_Country__c;
                        component.set("v.country", countryCode);
                        var countryFound = false;
                        for(var i = 0; i < this.countryOptions.length; i++) {
                            if (this.countryOptions[i].value == countryCode) {
                                component.set("v.countryName", this.countryOptions[i].label);
                                countryFound = true;
                            }
                        }
                        if (!countryFound) {
                            component.set("v.countryName", countryCode);
                        }

                        component.set("v.businessState", rv.Business_State__c);                        
                        if (rv.Approval_Status__c == null || rv.Approval_Status__c == '') { rv.Approval_Status__c = 'New'; }
                        var banner = component.find("approvalStatus");
                        $A.util.removeClass(banner, "status_New");
                        $A.util.removeClass(banner, "status_Submit");
                        $A.util.removeClass(banner, "status_Approved");
                        $A.util.removeClass(banner, "status_Declined");
                        $A.util.removeClass(banner, "status_Canceled");
                        let className = "status_"+rv.Approval_Status__c;
                        $A.util.addClass(banner, className);
                        
                        if (rv.Classification__c.indexOf('Duty Free') >= 0) {
                            console.log('[loadSampleOrders] showing banner groups for duty free');
                            component.set("v.showDutyFreeBanners", true);                            
                        } else {
                            component.set("v.showDutyFreeBanners", false);
                        }
                        if (rv.Banner_Group__c != null) {
                            component.set("v.selectedBannerGroup", rv.Banner_Group__c);
                        }
                        if (rv.Account__c != null) {
                            component.set("v.accountId", rv.Account__c);
                            component.set("v.accountName", rv.Account_Name__c);
                        }
                        /*
                        let activities = component.get("v.activities");
                        if (activities != null && rv.Activity__c != undefined) {
                            for(var i = 0; i < activities.length; i++) {
                                if (activities[i].value == rv.Activity__c) {
                                    activities[i].selected = true; break;
                                }
                            }
                            this.filterProductsToActivityProducts(component);
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
                        let reasonCodes = component.get("v.reasonCodes");
                        if (reasonCodes != null) {
                            for(var i = 0; i < reasonCodes.length; i++) {
                                if (reasonCodes[i].value == rv.Reason_Code__c) {
                                    reasonCodes[i].selected = true;
                                }
                            }
                        }
                        */
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
                            
                        //this.setupProductTableHeaders(component);
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
                                        products[j].internalOrderNumber = rv.SAP_Interfaced_Data_Items__r[i].Internal_Order_Number__c;
                                        products[j].convertedCases = rv.SAP_Interfaced_Data_Items__r[i].Total_Ordered_Cases__c;
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

                        helper.getUserDetails(component);
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
    getApprovalHistory : function(component, recordId) {
        var action = component.get("c.getApprovalHistory");
        action.setParams({
            "orderId" : recordId
        });
        action.setCallback(this, function(response){
            var callState = response.getState();
            console.log('[SampleOrderForm.helper.getApprovalHistory] getApprovalHistory action callback returned with state', callState);
            
            if (component.isValid()) {
                if (callState === "SUCCESS") {
                    try {                        
    	                var approvalHistory = response.getReturnValue();
                        component.set("v.approvalHistory", approvalHistory);
	                    console.log('[SampleOrderForm.helper.getApprovalHistory] returnmsg', approvalHistory);

                    } catch(ex1) {
                        console.log('[SampleOrderForm.helper.getApprovalHistory] exception', ex1);
                    }
                    
                } else if (callState === "INCOMPLETE") {
                    console.log('[SampleOrderForm.helper.getApprovalHistory] callback state is incomplete');    
                } else if (callState === "ERROR") {
                    var errors = response.getError();
                    console.log('[SampleOrderForm.helper.getApprovalHistory] callback returned errors. ', errors);                    
                    component.set("v.errors", errors);                    
                }
            }
            
        });
        $A.enqueueAction(action);
            
    },

    saveSampleOrder : function(component) {
        console.log('[SampleOrderForm.helper.saveSampleOrder]');
        component.set("v.isLoading", true);
        
        const helper = this;

    	var theSampleOrder = component.get("v.theSampleOrder");
        var businessState = component.get("v.businessState");
        var country = component.get("v.countryName");
        var bannerGroup = component.get("v.selectedBannerGroup");
        var recordTypeId = component.get("v.recordTypeId");
        var classification = component.get("v.classification");
        var costCenter = component.get("v.costCenter");
        var storageLocker = component.get("v.storageLocker");
        var accountId = component.get("v.accountId");
        var wholesalerId = component.get("v.wholesalerId");
        var marketId = component.get("v.marketId");
        var activityId = component.get("v.promotionActivity");
        let statuses = component.get("v.statuses");

        const reasonCode = component.get("v.reasonCode");
        const marketName = component.get("v.marketName");
        const recordTypeName = component.get("v.recordTypeName");
        const orderStatus = component.get("v.orderStatus");
        const recordType = component.get("v.recordTypeName");
        const products = component.get("v.productData");
        let selectedProducts = products.filter(p => p.quantity > 0);
            
        if (country == 'Mexico' && activityId != null && selectedProducts.length > 0) {
            theSampleOrder.Approval_Status__c = 'Approved';
        }
        
        var approvalStatus = component.get("v.approvalStatus");
        if (approvalStatus == undefined || approvalStatus == null) {
            approvalStatus = 'New';
        }
        console.log('[SampleOrderForm.helper.saveSampleOrder] country', country);
        console.log('[SampleOrderForm.helper.saveSampleOrder] marketId', marketId);
        //theSampleOrder.Approval_Status__c = approvalStatus;
        for(var i = 0; i < statuses.length; i++) {
            if (theSampleOrder.Approval_Status__c == statuses[i].value) {
                approvalStatus = statuses[i].label;
                break;
            }
        }
        
        component.set("v.approvalStatus", approvalStatus);

        if (marketName == 'Australia' && recordTypeName == 'Sample Order - Storeroom Request') {
            theSampleOrder.Account__c = storeroom;
            if (classification.indexOf('Sales') > -1) {
                theSampleOrder.Budget_Type__c = 'Brand Expense - Sales';
            } else if (classification.indexOf('Marketing') > -1) {
                theSampleOrder.Budget_Type__c = 'Brand Expense - Marketing';
            } else if (classification == 'Admin') {
                theSampleOrder.Budget_Type__c = 'SG&A';
            }
        }

        const stickerTypes = component.get("v.stickerTypes");
        if (stickerTypes != null && stickerTypes.length > 0) {
            let stickerType = stickerTypes.find(st => st.description == classification);
            theSampleOrder.Sticker_Type__c = stickerType == undefined ? null : stickerType.value;
        }
        
        //theSampleOrder.Business_Country__c = country;
        theSampleOrder.Business_State__c = businessState;
        theSampleOrder.RecordTypeId = recordTypeId;
        theSampleOrder.Classification__c = classification;
        theSampleOrder.Reason_Code__c = reasonCode;
        if (accountId != null && accountId.length > 0) {
            theSampleOrder.Account__c = accountId;
        }
        if (wholesalerId != null && wholesalerId.length > 0) {
            theSampleOrder.Wholesaler__c = wholesalerId;
        }
        if (bannerGroup != null && bannerGroup.length > 0) {
            theSampleOrder.Banner_Group__c = bannerGroup;
        }
        theSampleOrder.Cost_Center__c = costCenter;
        theSampleOrder.Storage_Locker__c = storageLocker;
        theSampleOrder.Activity__c = activityId;
        theSampleOrder.Order_Status__c = orderStatus;
        
        console.log('theSampleOrder', JSON.parse(JSON.stringify(theSampleOrder)));
		console.log('theSampleOrder.classification', theSampleOrder.Classification__c);
		var action = component.get("c.saveSampleOrder");
        action.setParams({
            "theSampleOrder" : theSampleOrder,
            "marketId" : marketId 
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
                            //component.set("v.closeDialog", true);
                            helper.closeSampleOrderDialog(component, rv.Id);
                        } else {
                            showToast = true;
                            const isApproved = rv.Is_Approved__c;
                            if (!isApproved) {
                                component.set("v.disableAddItems", false);
                                component.set("v.canSubmit", true);      
                            }
                            component.set("v.toastTitle", $A.get("$Label.c.Success"));
                            component.set("v.toastMessage", $A.get("$Label.c.Save_Success_Message"));                  
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
                    if (errors[0].message && errors[0].message.length > 0) {
                        msg += errors[0].message;
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
        const recordTypeName = component.get("v.recordTypeName");
        const marketName = component.get("v.userMarket");
        let showInternalOrderNumbers = component.get("v.showInternalOrderNumbers");
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
                if (showInternalOrderNumbers && rows[i].quantity > 0 && (rows[i].internalOrderNumber == null || rows[i].internalOrderNumber == '')) {
                    throw "You must select an Internal Order Number for SD0 Sample Orders.";
                }
                if (rows[i].quantity > 0) {
                    console.log('[SampleOrderForm.helper.saveSampleOrderItems] row', rows[i]);                
                    items.push({
                        id: rows[i].id,
                        internalOrderNumber: rows[i].internalOrderNumber,
                        brandId: rows[i].brandId,
                        brandName: rows[i].brandName,
                        packQty: rows[i].packQty,
                        productId: rows[i].productId,
                        productName: rows[i].productName,
                        quantity: rows[i].quantity,
                        units: rows[i].units,
                        price: rows[i].price,
                        convertedCases: rows[i].convertedCases,
                        totalActualQty: rows[i].totalActualQty,
                        totalPlannedQty: rows[i].totalPlannedQty,
                        pmiActualId: rows[i].pmiActualId
                    });
                    console.log('[SampleOrderForm.helper.saveSampleOrderItems] items', items);   
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
                "recordTypeName": recordTypeName,
                "market": marketName,
                "activityId": theSampleOrder.Activity__c,
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

                            var recordType = component.get("v.recordTypeName");
                            var classification = component.get("v.classification");
                            var rv = response.getReturnValue();
                            console.log("[SampleOrderForm.helper.saveItems] returnvalue", rv);
                            var productData = component.get("v.productData");
                            for(var i = 0; i < rv.length; i++) {
                                for(var j = 0; j < rows.length; j++) {
                                    if (productData[j].productId == rv[i].Product__c) {
                                        productData[j].id = rv[i].Id;
                                        productData[j].quantity = rv[i].Quantity__c;            
                                        console.log('[SampleOrderForm.helper.saveItems] recordType, classification', recordType, classification);                            
                                        if (recordType == 'Sample Order - MEX' || recordType == 'Sample Order - TWN' || classification == 'AU6-Ecomm Sample Orders') {
                                            productData[j].units = productData[j].quantity;
                                        } else {
                                            productData[j].units = productData[j].quantity * productData[j].packQty;
                                        }
                                        productData[j].internalOrderNumber = rv[i].Internal_Order_Number__c;
                                        productData[j].pmiActualId = rv[i].PMI_Actual__c;
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
                                let orderLocked = component.get("v.orderLocked");
                                let lockStatusInput = component.get("v.lockStatusInput");
                                if (orderLocked && userMarket == 'Taiwan') {
                                    component.set("v.disableButtons", lockStatusInput);
                                }                         
                            }
                            showToast = true;
                            component.set("v.toastTitle", $A.get("$Label.c.Success"));
                            component.set("v.toastMessage", $A.get("$Label.c.Save_Success_Message"));
                            
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
            component.set("v.toastMessage", ex);
            var toastPanel = component.find("toastPanel");
            $A.util.removeClass(toastPanel, "slds-hide");
        } finally {
            component.set("v.isLoading", false);
        }
    },
        
    submitOrderForApproval : function(component) {
        component.set("v.isLoading", true);
        var theSampleOrder = component.get("v.theSampleOrder");
        const market = component.get("v.userMarket");
        const recordType = component.get("v.recordTypeName");
        console.log("[SampleOrderForm.helper.submitForApproval] market", market);
        console.log("[SampleOrderForm.helper.submitForApproval] recordType", recordType);
        var action = component.get("c.submitForApproval");
        var helper = this;
        action.setParams({
            "sapId"      : theSampleOrder.Id,
            "market" 	 : market,
            "recordType" : recordType
        });
        action.setCallback(this, function(response) {
            var showToast = false;
            if (component.isValid()) {
                component.set("v.isLoading", false);
                var callState = response.getState();
                if (callState === "SUCCESS") {
                    try {
                        component.set("v.closeDialog", true); 
                    
                        var sampleOrderLbl = component.get("v.sampleOrderLabel");
                        var successLbl = component.get("v.successLabel");
                        var msg = component.get("v.submitForApprovalSuccessMessage").replace('%0', sampleOrderLbl);
                        helper.showToast(component, "success", successLbl, msg);
                        helper.closeSampleOrderDialog(component, theSampleOrder.Id);
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
                    var msg = self.getErrorMessage(errors);
                    component.set("v.toastMessage", "Failed to save Sample Order. " + msg);
                    
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
    getErrorMessage : function(errors) {
        var msg = '';
        if (errors == undefined) {
            return;
        }

        for(var j = 0; j < errors.length; j++) {
            if (errors[j].duplicateResults != undefined && errors[j].duplicateResults.length > 0) {
                for(var i = 0; i < errors[j].duplicateResults.length; i++) {
                    msg += errors[j].duplicateResults[i].message + '\n';
                }
            }
            if (errors[j].fieldErrors != undefined && errors[j].fieldErrors.length > 0) {
                for(var i = 0; i < errors[j].fieldErrors.length; i++) {
                    msg += errors[j].fieldErrors[i].message + '\n';
                }
            }
            if (errors[j].pageErrors != undefined && errors[j].pageErrors.length > 0) {
                for(var i = 0; i < errors[j].pageErrors.length; i++) {
                    msg += errors[j].pageErrors[i].message + '\n';
                }
            }
        }

        console.log('[SampleOrderForm.helper.getErrorMessage] msg', msg);
        return msg;
    },
    showToast: function(component, type, title, msg) {
        component.find("notifLib").showToast({
            "variant": type,
            "header": title,
            "message": msg,
            "mode": "sticky"
        });
        /*
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": msg,
            "mode": "dismissable"
        });
        */
    }
})