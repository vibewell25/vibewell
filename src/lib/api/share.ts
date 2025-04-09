export interface ShareData {
  id: string;
  imageData: string;
  type: 'makeup' | 'hairstyle' | 'accessory';
  productName?: string;
  createdAt: string;
}

export async function getShareData(id: string): Promise<ShareData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/share?id=${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching share data:', error);
    return null;
  }
} 