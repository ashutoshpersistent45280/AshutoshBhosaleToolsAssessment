/**
 * @description RelatedListController class for returning the list of records and edit records
 */
public with sharing class RelatedListController {
    /**
    * @description fetchData method will return the list of records of a particular object
    */
    @AuraEnabled(cacheable=true)
    public static List<sObject> fetchData(Id recordId, String objectApiName) {
        List<sObject> records = new List<sObject>();
        try {
            SObjectType objectType = Schema.getGlobalDescribe().get(objectApiName);
            if (objectType != null) {
                DescribeSObjectResult objectDescribe = objectType.getDescribe();
                String query = 'SELECT Id';
                for (FieldDefinition field : objectDescribe.fields.getMap().values()) {
                    if (field.isAccessible() && field.isFilterable() && field.isSortable()) {
                        query += ', ' + field.getName();
                    }
                }
                query += ' FROM ' + objectApiName + ' WHERE ' + objectDescribe.getKeyPrefix() + 'Id = :recordId';
                records = Database.query(query);
            }
        } catch (Exception e) {}
        return records;
    }
    /**
    * @description saveRecord method will edit and update the record for a particular object
    */
    @AuraEnabled
    public static void saveRecord(Map<String, Object> fields) {
        try {
            SObject record = (SObject)Type.forName((String)fields.get('type')).newInstance();
            record.put('Id', fields.get('Id'));
            record.put('Name', fields.get('Name'));
            for (String fieldName : fields.keySet()) {
                if (fieldName != 'Id' && fieldName != 'type'){                    
                record.put(fieldName, fields.get(fieldName));
                }
            }
            update record;
        }catch (Exception e) {}
}
}

