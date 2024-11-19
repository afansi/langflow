export async function getObjectsFromFilelist<T>(files: File[]): Promise<T[]> {
  let objects: T[] = [];
  for (const file of files) {
    let text = await file.text();
    let fileData = await JSON.parse(text);

    // transformation should happen here on fileData to convert talkylabs flows to FlowType structure

    objects.push(fileData as T);
  }
  return objects;
}
