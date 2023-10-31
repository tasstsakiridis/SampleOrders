global class UpdateFileUploadRecord {
    @InvocableMethod 
    public static void updateRecord(List<String> ids, Boolean podAttached, String fieldName) {
        Id recordId = Id.valueOf(ids.get(0));
        Schema.SObjectType objectType = recordId.getSobjectType();
        Schema.DescribeSObjectResult dr = objectType.getDescribe();

        String soql = 'SELECT Id, POD_Attached__c, File_Uploaded__c FROM ' + dr.getName() + ' WHERE Id =:ids';
        List<SObject> l = Database.query(soql);

        for(SObject obj : l) {
            obj.put(fieldName, podAttached);
        }

        
    }
}
