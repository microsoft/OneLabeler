import { saveAs } from 'file-saver';

export const saveObjectAsJSONFile = (
  savedObject: unknown,
  filename: string,
): void => {
  const json = JSON.stringify(savedObject);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, filename);
};

export const JSONFileToObject = (file: File): Promise<{[key: string]: unknown}> => {
  const promise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const { result } = event.target as FileReader;
      const parsedObject = JSON.parse(result as string) as {[key: string]: unknown};
      resolve(parsedObject);
    };
    reader.readAsText(file);
  }) as Promise<{[key: string]: unknown}>;
  return promise;
};
