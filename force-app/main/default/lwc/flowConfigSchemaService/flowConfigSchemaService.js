import describeSObjectPath from "@salesforce/apex/FlowConfigApexTypeController.describeSObjectPath";

const recordPathRequests = new Map();

function parseDescriptor(response) {
  if (!response) {
    return null;
  }
  const descriptor =
    typeof response === "string" ? JSON.parse(response) : response;
  return descriptor?.dataType ? descriptor : null;
}

/**
 * Resolves one record field path and shares the in-flight/result promise across
 * every picker instance in the editor. Rejected requests are evicted so a
 * temporary metadata failure can be retried.
 */
export function describeRecordPath(objectApiName, fieldPath) {
  if (!objectApiName || !fieldPath) {
    return Promise.resolve(null);
  }
  const key = `${objectApiName}:${fieldPath}`;
  if (!recordPathRequests.has(key)) {
    const request = describeSObjectPath({ objectApiName, fieldPath })
      .then(parseDescriptor)
      .catch((error) => {
        recordPathRequests.delete(key);
        throw error;
      });
    recordPathRequests.set(key, request);
  }
  return recordPathRequests.get(key);
}

/** Test and explicit-refresh hook. */
export function clearRecordPathCache() {
  recordPathRequests.clear();
}
