public with sharing class FlowConfigApexTypeController {
  private static final Map<String, Schema.SObjectType> GLOBAL_DESCRIBE = Schema.getGlobalDescribe();

  public class MemberDescriptor implements Comparable {
    @AuraEnabled
    public String name { get; set; }
    @AuraEnabled
    public String label { get; set; }
    @AuraEnabled
    public String dataType { get; set; }
    @AuraEnabled
    public String apexClass { get; set; }
    @AuraEnabled
    public String objectType { get; set; }
    @AuraEnabled
    public Boolean isCollection { get; set; }
    @AuraEnabled
    public String sourceType { get; set; }
    @AuraEnabled
    public String sourceDataType { get; set; }
    @AuraEnabled
    public List<String> referenceTargets { get; set; }

    public Integer compareTo(Object other) {
      MemberDescriptor candidate = (MemberDescriptor) other;
      String left = String.isBlank(label) ? name : label;
      String right = String.isBlank(candidate.label)
        ? candidate.name
        : candidate.label;
      return left.toLowerCase().compareTo(right.toLowerCase());
    }
  }

  public class SObjectPathDescriptor {
    @AuraEnabled
    public String name { get; set; }
    @AuraEnabled
    public String label { get; set; }
    @AuraEnabled
    public String dataType { get; set; }
    @AuraEnabled
    public String sourceDataType { get; set; }
    @AuraEnabled
    public String objectType { get; set; }
    @AuraEnabled
    public Boolean isCollection { get; set; }
    @AuraEnabled
    public List<String> labels { get; set; }
    @AuraEnabled
    public List<String> objectTypes { get; set; }
    @AuraEnabled
    public String parentObjectType { get; set; }
    @AuraEnabled
    public List<String> referenceTargets { get; set; }
  }

  public class HierarchySettingDescriptor {
    @AuraEnabled
    public String name { get; set; }
    @AuraEnabled
    public String label { get; set; }
    @AuraEnabled
    public List<MemberDescriptor> fields { get; set; }
  }

  @AuraEnabled(cacheable=true)
  public static List<MemberDescriptor> describeType(String apexClassName) {
    if (String.isBlank(apexClassName)) {
      return new List<MemberDescriptor>();
    }

    ClassIdentity identity = parseClassIdentity(apexClassName);
    List<ApexClass> candidates = [
      SELECT Name, NamespacePrefix, Body
      FROM ApexClass
      WHERE Name = :identity.className
    ];
    for (ApexClass candidate : candidates) {
      if (
        candidate.NamespacePrefix == identity.namespacePrefix ||
        (candidate.NamespacePrefix != null &&
        identity.namespacePrefix != null &&
        candidate.NamespacePrefix.equalsIgnoreCase(identity.namespacePrefix))
      ) {
        return parseBody(candidate.Body, candidate.NamespacePrefix);
      }
    }
    if (identity.namespacePrefix == null && candidates.size() == 1) {
      ApexClass onlyCandidate = candidates[0];
      return parseBody(onlyCandidate.Body, onlyCandidate.NamespacePrefix);
    }
    throw new AuraHandledException(
      'Unable to resolve Apex-defined type "' + apexClassName + '".'
    );
  }

  @AuraEnabled(cacheable=true)
  public static SObjectPathDescriptor describeSObjectPath(
    String objectApiName,
    String fieldPath
  ) {
    if (String.isBlank(objectApiName) || String.isBlank(fieldPath)) {
      return null;
    }
    Schema.SObjectType currentType = GLOBAL_DESCRIBE.get(objectApiName);
    if (currentType == null || !currentType.getDescribe().isAccessible()) {
      return null;
    }

    List<String> labels = new List<String>();
    List<String> objectTypes = new List<String>();
    Schema.DescribeFieldResult finalField;
    String parentObjectType;
    List<String> pathSegments = fieldPath.split('\\.');
    for (Integer pathIndex = 0; pathIndex < pathSegments.size(); pathIndex++) {
      String segment = pathSegments[pathIndex];
      Schema.SObjectField token = findField(currentType, segment);
      if (token == null) {
        return null;
      }
      parentObjectType = currentType.getDescribe().getName();
      finalField = token.getDescribe();
      if (!finalField.isAccessible()) {
        return null;
      }
      String nextSegment = pathIndex < pathSegments.size() - 1
        ? pathSegments[pathIndex + 1]
        : null;
      Schema.SObjectType referenceType = referenceForPath(
        finalField,
        nextSegment
      );
      labels.add(
        pathIndex < pathSegments.size() - 1 &&
          !String.isBlank(finalField.getRelationshipName())
          ? finalField.getRelationshipName()
          : finalField.getLabel()
      );
      if (referenceType != null) {
        currentType = referenceType;
        objectTypes.add(currentType.getDescribe().getName());
      } else {
        if (nextSegment != null) {
          return null;
        }
        objectTypes.add(null);
      }
    }

    if (finalField == null) {
      return null;
    }
    String sourceType = String.valueOf(finalField.getType());
    String dataType = flowDataTypeForField(finalField.getType());
    MemberDescriptor fieldDescriptor = describeField(finalField);
    SObjectPathDescriptor descriptor = new SObjectPathDescriptor();
    descriptor.name = fieldDescriptor.name;
    descriptor.label = fieldDescriptor.label;
    descriptor.dataType = dataType;
    descriptor.sourceDataType = sourceType;
    descriptor.objectType = fieldDescriptor.objectType;
    descriptor.isCollection = false;
    descriptor.labels = labels;
    descriptor.objectTypes = objectTypes;
    descriptor.parentObjectType = parentObjectType;
    descriptor.referenceTargets = fieldDescriptor.referenceTargets;
    return descriptor;
  }

  @AuraEnabled(cacheable=true)
  public static List<HierarchySettingDescriptor> describeHierarchySettings() {
    List<HierarchySettingDescriptor> settings = new List<HierarchySettingDescriptor>();
    List<String> objectNames = new List<String>(GLOBAL_DESCRIBE.keySet());
    objectNames.sort();
    for (String objectName : objectNames) {
      Schema.DescribeSObjectResult objectDescribe = GLOBAL_DESCRIBE
        .get(objectName)
        .getDescribe();
      if (!objectDescribe.isAccessible() || !objectDescribe.isCustomSetting()) {
        continue;
      }
      Schema.SObjectField nameToken = objectDescribe.fields.getMap()
        .get('Name');
      if (nameToken == null || !nameToken.getDescribe().isNillable()) {
        continue;
      }
      List<MemberDescriptor> fields = new List<MemberDescriptor>();
      for (
        Schema.SObjectField fieldToken : objectDescribe.fields.getMap().values()
      ) {
        Schema.DescribeFieldResult fieldDescribe = fieldToken.getDescribe();
        if (!fieldDescribe.isCustom() || !fieldDescribe.isAccessible()) {
          continue;
        }
        fields.add(describeField(fieldDescribe));
      }
      if (!fields.isEmpty()) {
        fields.sort();
        HierarchySettingDescriptor setting = new HierarchySettingDescriptor();
        setting.name = objectDescribe.getName();
        setting.label = objectDescribe.getLabel();
        setting.fields = fields;
        settings.add(setting);
      }
    }
    return settings;
  }

  private static Schema.SObjectField findField(
    Schema.SObjectType objectType,
    String pathSegment
  ) {
    Map<String, Schema.SObjectField> fields = objectType
      .getDescribe()
      .fields.getMap();
    Schema.SObjectField exactMatch = fields.get(pathSegment);
    if (exactMatch != null) {
      return exactMatch;
    }
    for (String apiName : fields.keySet()) {
      Schema.SObjectField candidate = fields.get(apiName);
      Schema.DescribeFieldResult fieldDescribe = candidate.getDescribe();
      if (
        apiName.equalsIgnoreCase(pathSegment) ||
        (!String.isBlank(fieldDescribe.getRelationshipName()) &&
        fieldDescribe.getRelationshipName().equalsIgnoreCase(pathSegment))
      ) {
        return candidate;
      }
    }
    return null;
  }

  private static Schema.SObjectType firstReference(
    Schema.DescribeFieldResult fieldDescribe
  ) {
    List<Schema.SObjectType> references = accessibleReferences(fieldDescribe);
    return references.isEmpty() ? null : references[0];
  }

  private static Schema.SObjectType referenceForPath(
    Schema.DescribeFieldResult fieldDescribe,
    String nextSegment
  ) {
    List<Schema.SObjectType> references = accessibleReferences(fieldDescribe);
    if (String.isBlank(nextSegment)) {
      return references.isEmpty() ? null : references[0];
    }
    for (Schema.SObjectType referenceType : references) {
      Schema.SObjectField nextField = findField(referenceType, nextSegment);
      if (nextField != null && nextField.getDescribe().isAccessible()) {
        return referenceType;
      }
    }
    return null;
  }

  private static List<Schema.SObjectType> accessibleReferences(
    Schema.DescribeFieldResult fieldDescribe
  ) {
    List<Schema.SObjectType> accessible = new List<Schema.SObjectType>();
    for (Schema.SObjectType referenceType : fieldDescribe.getReferenceTo()) {
      if (referenceType.getDescribe().isAccessible()) {
        accessible.add(referenceType);
      }
    }
    return accessible;
  }

  private static MemberDescriptor describeField(
    Schema.DescribeFieldResult fieldDescribe
  ) {
    Schema.SObjectType referenceType = firstReference(fieldDescribe);
    List<String> referenceTargets = new List<String>();
    for (Schema.SObjectType candidate : accessibleReferences(fieldDescribe)) {
      referenceTargets.add(candidate.getDescribe().getName());
    }
    MemberDescriptor descriptor = new MemberDescriptor();
    descriptor.name = fieldDescribe.getName();
    descriptor.label = fieldDescribe.getLabel();
    descriptor.dataType = flowDataTypeForField(fieldDescribe.getType());
    descriptor.sourceDataType = String.valueOf(fieldDescribe.getType());
    descriptor.sourceType = descriptor.sourceDataType;
    descriptor.objectType = referenceType == null
      ? null
      : referenceType.getDescribe().getName();
    descriptor.referenceTargets = referenceTargets;
    descriptor.isCollection = false;
    return descriptor;
  }

  private static String flowDataTypeForField(Schema.DisplayType fieldType) {
    if (fieldType == Schema.DisplayType.Boolean) {
      return 'Boolean';
    }
    if (fieldType == Schema.DisplayType.Currency) {
      return 'Currency';
    }
    if (fieldType == Schema.DisplayType.Date) {
      return 'Date';
    }
    if (fieldType == Schema.DisplayType.DateTime) {
      return 'DateTime';
    }
    if (
      fieldType == Schema.DisplayType.Double ||
      fieldType == Schema.DisplayType.Integer ||
      fieldType == Schema.DisplayType.Long ||
      fieldType == Schema.DisplayType.Percent
    ) {
      return 'Number';
    }
    if (fieldType == Schema.DisplayType.MultiPicklist) {
      return 'Multipicklist';
    }
    if (fieldType == Schema.DisplayType.Picklist) {
      return 'Picklist';
    }
    if (fieldType == Schema.DisplayType.Time) {
      return 'Time';
    }
    if (fieldType == Schema.DisplayType.Reference) {
      return 'SObject';
    }
    return 'String';
  }

  @TestVisible
  private static List<MemberDescriptor> parseBody(
    String body,
    String namespacePrefix
  ) {
    List<MemberDescriptor> members = new List<MemberDescriptor>();
    if (String.isBlank(body)) {
      return members;
    }

    String source = body
      .replaceAll('(?s)/\\*.*?\\*/', ' ')
      .replaceAll('(?m)//.*$', ' ');
    Pattern memberPattern = Pattern.compile(
      '(?is)@AuraEnabled(?:\\s*\\([^)]*\\))?\\s+' +
        '(?:(?:global|public|protected|private|static|transient|virtual|override|final)\\s+)*' +
        '([A-Za-z_][A-Za-z0-9_.$<>\\[\\], ]*)\\s+' +
        '([A-Za-z_][A-Za-z0-9_]*)\\s*(?:;|\\{)'
    );
    Matcher matcher = memberPattern.matcher(source);
    Set<String> seenNames = new Set<String>();
    while (matcher.find()) {
      String memberName = matcher.group(2);
      if (seenNames.contains(memberName)) {
        continue;
      }
      seenNames.add(memberName);
      members.add(
        toDescriptor(memberName, matcher.group(1).trim(), namespacePrefix)
      );
    }
    return members;
  }

  private static MemberDescriptor toDescriptor(
    String memberName,
    String declaredType,
    String namespacePrefix
  ) {
    MemberDescriptor descriptor = new MemberDescriptor();
    descriptor.name = memberName;
    descriptor.label = humanize(memberName);
    descriptor.sourceType = declaredType;

    String valueType = declaredType.replaceAll('\\s+', '');
    descriptor.isCollection = valueType.endsWith('[]');
    if (descriptor.isCollection) {
      valueType = valueType.substring(0, valueType.length() - 2);
    }
    Matcher collectionMatcher = Pattern.compile('(?i)^(?:List|Set)<(.+)>$')
      .matcher(valueType);
    if (collectionMatcher.matches()) {
      descriptor.isCollection = true;
      valueType = collectionMatcher.group(1);
    }

    String normalized = valueType.toLowerCase();
    if (
      new Set<String>{ 'decimal', 'double', 'integer', 'long' }
        .contains(normalized)
    ) {
      descriptor.dataType = 'Number';
    } else if (normalized == 'boolean') {
      descriptor.dataType = 'Boolean';
    } else if (normalized == 'date') {
      descriptor.dataType = 'Date';
    } else if (normalized == 'datetime') {
      descriptor.dataType = 'DateTime';
    } else if (normalized == 'time') {
      descriptor.dataType = 'Time';
    } else if (new Set<String>{ 'string', 'id' }.contains(normalized)) {
      descriptor.dataType = 'String';
    } else if (GLOBAL_DESCRIBE.containsKey(valueType)) {
      descriptor.dataType = 'SObject';
      descriptor.objectType = GLOBAL_DESCRIBE
        .get(valueType)
        .getDescribe()
        .getName();
    } else {
      descriptor.dataType = 'Apex';
      descriptor.apexClass = qualifyApexType(valueType, namespacePrefix);
    }
    return descriptor;
  }

  private static String qualifyApexType(
    String valueType,
    String namespacePrefix
  ) {
    if (valueType.contains('__') || valueType.contains('.')) {
      return valueType;
    }
    return String.isBlank(namespacePrefix)
      ? valueType
      : namespacePrefix + '__' + valueType;
  }

  private static String humanize(String value) {
    String label = value.replaceAll('([a-z0-9])([A-Z])', '$1 $2');
    return label.substring(0, 1).toUpperCase() + label.substring(1);
  }

  private class ClassIdentity {
    String namespacePrefix;
    String className;
  }

  private static ClassIdentity parseClassIdentity(String apexClassName) {
    ClassIdentity identity = new ClassIdentity();
    String normalized = apexClassName
      .trim()
      .replace('{', '')
      .replace('}', '')
      .replace('[]', '');
    normalized = normalized.replaceAll('(?i)^apex://', '');
    normalized = normalized.replace('/', '.').replace(':', '.');
    Integer namespaceSeparator = normalized.indexOf('__');
    if (namespaceSeparator > 0) {
      identity.namespacePrefix = normalized.substring(0, namespaceSeparator);
      identity.className = normalized.substring(namespaceSeparator + 2);
      return identity;
    }
    List<String> dotted = normalized.split('\\.');
    if (dotted.size() == 2) {
      identity.namespacePrefix = dotted[0];
      identity.className = dotted[1];
    } else {
      identity.namespacePrefix = null;
      identity.className = normalized;
    }
    return identity;
  }
}
