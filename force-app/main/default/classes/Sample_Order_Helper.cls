public with sharing class Sample_Order_Helper {

    public static List<SAP_Interfaced_Data__c> getSampleOrders() {
        return [SELECT Id, Name, Order_Number__c, Approval_Status__c, Requested_Delivery_Date__c, Authorised_By__c, Authorised_By__r.Name, Authorised_Date__c, Business_Name__c, Contact_Name__c FROM SAP_Interfaced_Data__c ORDER BY CreatedDate DESC];
    }
}