import { saveAs } from 'file-saver';

export const saveJsonFile = (
  data: unknown,
  filename: string,
): void => {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, filename);
};

export const loadJsonFile = (file: File): Promise<unknown> => {
  const promise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const { result } = event.target as FileReader;
      const parsedObject = JSON.parse(result as string) as unknown;
      resolve(parsedObject);
    };
    reader.readAsText(file);
  }) as Promise<unknown>;
  return promise;
};
