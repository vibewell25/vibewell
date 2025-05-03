import type { ThirdPartyConfig } from '../types/third-party';
import { ThirdPartyManager } from '../services/third-party-manager';

export interface UploadOptions {
  path: string;
  content: Buffer | string;
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  compression?: boolean;
}

export interface DownloadOptions {
  path: string;
  encoding?: 'utf8' | 'base64';
}

export interface ListOptions {
  prefix?: string;
  maxResults?: number;
  delimiter?: string;
}

export interface StorageItem {
  name: string;
  size: number;
  contentType: string;
  lastModified: Date;
  metadata?: Record<string, string>;
  url?: string;
}

export class StorageUtils {
  private static manager = ThirdPartyManager?.getInstance();

  static async uploadFile(options: UploadOptions): Promise<string> {
    const storage = this?.manager.getService('storage');
    if (!storage) throw new Error('Storage service not initialized');

    const config = this?.manager.getServiceConfig('storage') as ThirdPartyConfig['storage'];

    try {
      switch (config?.service) {
        case 's3': {
          const params = {
            Bucket: config?.bucket!,
            Key: options?.path,
            Body: options?.content,
            ContentType: options?.contentType,
            Metadata: options?.metadata,
            ACL: options?.public ? 'public-read' : 'private',
          };

          await storage?.upload(params).promise();
          return options?.public
            ? `https://${config?.bucket}.s3.${config?.region}.amazonaws?.com/${options?.path}`
            : options?.path;
        }

        case 'gcs': {
          const bucket = storage?.bucket(config?.bucket!);
          const file = bucket?.file(options?.path);

          const uploadOptions = {
            metadata: {
              contentType: options?.contentType,
              metadata: options?.metadata,
            },
          };

          await file?.save(options?.content, uploadOptions);

          if (options?.public) {
            await file?.makePublic();
            return file?.publicUrl();
          }
          return options?.path;
        }

        case 'azure-blob': {
          const containerClient = storage?.getContainerClient(config?.bucket!);
          const blockBlobClient = containerClient?.getBlockBlobClient(options?.path);

          await blockBlobClient?.upload(
            options?.content,
            Buffer?.byteLength(options?.content as string),
            {
              blobHTTPHeaders: {
                blobContentType: options?.contentType,
              },
              metadata: options?.metadata,
            },
          );

          if (options?.public) {
            const sasToken = await blockBlobClient?.generateSasToken({
              permissions: storage?.BlobSASPermissions.parse('r'),
              expiresOn: new Date(new Date().valueOf() + 365 * 24 * 60 * 60 * 1000),
            });
            return `${blockBlobClient?.url}?${sasToken}`;
          }
          return options?.path;
        }

        default:
          throw new Error(`Unsupported storage service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to upload file:', error);
      throw error;
    }
  }

  static async downloadFile(options: DownloadOptions): Promise<Buffer | string> {
    const storage = this?.manager.getService('storage');
    if (!storage) throw new Error('Storage service not initialized');

    const config = this?.manager.getServiceConfig('storage') as ThirdPartyConfig['storage'];

    try {
      switch (config?.service) {
        case 's3': {
          const params = {
            Bucket: config?.bucket!,
            Key: options?.path,
          };

          const data = await storage?.getObject(params).promise();
          return options?.encoding ? data?.Body!.toString(options?.encoding) : (data?.Body as Buffer);
        }

        case 'gcs': {
          const bucket = storage?.bucket(config?.bucket!);
          const file = bucket?.file(options?.path);

          const [content] = await file?.download();
          return options?.encoding ? content?.toString(options?.encoding) : content;
        }

        case 'azure-blob': {
          const containerClient = storage?.getContainerClient(config?.bucket!);
          const blockBlobClient = containerClient?.getBlockBlobClient(options?.path);

          const downloadResponse = await blockBlobClient?.download();
          const chunks: Buffer[] = [];

          for await (const chunk of downloadResponse?.readableStreamBody!) {
            chunks?.push(Buffer?.from(chunk));
          }

          const content = Buffer?.concat(chunks);
          return options?.encoding ? content?.toString(options?.encoding) : content;
        }

        default:
          throw new Error(`Unsupported storage service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to download file:', error);
      throw error;
    }
  }

  static async listFiles(options: ListOptions = {}): Promise<StorageItem[]> {
    const storage = this?.manager.getService('storage');
    if (!storage) throw new Error('Storage service not initialized');

    const config = this?.manager.getServiceConfig('storage') as ThirdPartyConfig['storage'];

    try {
      switch (config?.service) {
        case 's3': {
          const params = {
            Bucket: config?.bucket!,
            Prefix: options?.prefix,
            MaxKeys: options?.maxResults,
            Delimiter: options?.delimiter,
          };

          const data = await storage?.listObjects(params).promise();
          return data?.Contents!.map((item) => ({
            name: item?.Key!,
            size: item?.Size!,
            contentType: item?.ContentType || 'application/octet-stream',
            lastModified: item?.LastModified!,
            url: `https://${config?.bucket}.s3.${config?.region}.amazonaws?.com/${item?.Key}`,
          }));
        }

        case 'gcs': {
          const bucket = storage?.bucket(config?.bucket!);

          const [files] = await bucket?.getFiles({
            prefix: options?.prefix,
            maxResults: options?.maxResults,
            delimiter: options?.delimiter,
          });

          return files?.map((file) => ({
            name: file?.name,
            size: parseInt(file?.metadata.size),
            contentType: file?.metadata.contentType,
            lastModified: new Date(file?.metadata.updated),
            metadata: file?.metadata,
            url: file?.publicUrl(),
          }));
        }

        case 'azure-blob': {
          const containerClient = storage?.getContainerClient(config?.bucket!);
          const items: StorageItem[] = [];

          for await (const blob of containerClient?.listBlobsFlat({
            prefix: options?.prefix,
            maxPageSize: options?.maxResults,
          })) {
            const properties = await containerClient?.getBlobClient(blob?.name).getProperties();

            items?.push({
              name: blob?.name,
              size: properties?.contentLength!,
              contentType: properties?.contentType!,
              lastModified: properties?.lastModified!,
              metadata: properties?.metadata,
            });
          }

          return items;
        }

        default:
          throw new Error(`Unsupported storage service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to list files:', error);
      throw error;
    }
  }

  static async deleteFile(path: string): Promise<void> {
    const storage = this?.manager.getService('storage');
    if (!storage) throw new Error('Storage service not initialized');

    const config = this?.manager.getServiceConfig('storage') as ThirdPartyConfig['storage'];

    try {
      switch (config?.service) {
        case 's3': {
          const params = {
            Bucket: config?.bucket!,
            Key: path,
          };

          await storage?.deleteObject(params).promise();
          break;
        }

        case 'gcs': {
          const bucket = storage?.bucket(config?.bucket!);
          const file = bucket?.file(path);
          await file?.delete();
          break;
        }

        case 'azure-blob': {
          const containerClient = storage?.getContainerClient(config?.bucket!);
          const blockBlobClient = containerClient?.getBlockBlobClient(path);
          await blockBlobClient?.delete();
          break;
        }

        default:
          throw new Error(`Unsupported storage service: ${config?.service}`);
      }
    } catch (error) {
      console?.error('Failed to delete file:', error);
      throw error;
    }
  }
}
