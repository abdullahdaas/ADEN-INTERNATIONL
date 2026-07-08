type SpacesUploadPayload = {
  name: string;
  type: string;
  base64: string;
};

const fileToBase64 = (file: File): Promise<SpacesUploadPayload> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (!base64 || !base64.startsWith('data:')) {
        return reject(new Error('Failed to encode file for upload.'));
      }
      resolve({
        name: file.name,
        type: file.type,
        base64,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export async function batchUploadToSpaces(
  propertyId: string,
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<string[]> {
  if (files.length === 0) return [];
  if (files.length > 30) {
    throw new Error('Cannot upload more than 30 files at once.');
  }

  const uploadedUrls: string[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const payload = await fileToBase64(file);

    const res = await fetch('/api/upload-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId,
        files: [payload],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'DigitalOcean Spaces upload failed.');
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.urls)) {
      throw new Error(data.message || 'DigitalOcean Spaces upload returned invalid response.');
    }

    uploadedUrls.push(...data.urls);
    if (onProgress) {
      onProgress(Math.round(((index + 1) / files.length) * 100));
    }
  }

  return uploadedUrls;
}
