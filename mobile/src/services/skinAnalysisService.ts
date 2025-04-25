import { serverBaseUrl } from '../config';
import { SkinAnalysisResult } from '../types/navigation';

export const analyzeSkin = async (uri: string): Promise<SkinAnalysisResult> => {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  // @ts-ignore
  formData.append('photo', { uri, name: filename, type });

  const res = await fetch(`${serverBaseUrl}/api/skin-analysis`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const data = await res.json();
  return data.results as SkinAnalysisResult;
};
