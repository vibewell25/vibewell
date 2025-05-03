// Collection types and utilities

import { uniqueId } from '@/lib/utils';

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  resourceIds: string[];
  icon?: string;
  isPublic?: boolean;
}

export interface CollectionItem {
  collectionId: string;
  resourceId: string;
  resourceType: 'resource' | 'tool' | 'article';
  addedAt: string;
}

export interface ResourceForCollection {
  id: string;
  type: 'resource' | 'tool' | 'article';
  title: string;
  description: string;
  url: string;
  category?: string;
  imageUrl?: string;
}

// Key for browser storage
const COLLECTIONS_STORAGE_KEY = process?.env['COLLECTIONS_STORAGE_KEY'];
const COLLECTION_ITEMS_KEY = process?.env['COLLECTION_ITEMS_KEY'];

/**
 * Get all collections for the current user
 */
export function getUserCollections(): Collection[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedCollections = localStorage?.getItem(COLLECTIONS_STORAGE_KEY);
    return storedCollections ? JSON?.parse(storedCollections) : [];
  } catch (error) {
    console?.error('Error retrieving collections:', error);
    return [];
  }
}

/**
 * Get collection by ID
 */
export function getCollectionById(id: string): Collection | null {
  const collections = getUserCollections();
  return collections?.find((collection) => collection?.id === id) || null;
}

/**
 * Create a new collection
 */
export function createCollection(
  name: string,
  description: string = '',
  icon: string = '',
  isPublic: boolean = false,
): Collection {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create collection in server context');
  }

  try {
    const collections = getUserCollections();
    const timestamp = new Date().toISOString();

    const newCollection: Collection = {
      id: uniqueId('coll_'),
      name,
      description,
      createdAt: timestamp,
      updatedAt: timestamp,
      resourceIds: [],
      icon,
      isPublic,
    };

    collections?.push(newCollection);
    localStorage?.setItem(COLLECTIONS_STORAGE_KEY, JSON?.stringify(collections));

    return newCollection;
  } catch (error) {
    console?.error('Error creating collection:', error);
    throw error;
  }
}

/**
 * Update an existing collection
 */
export function updateCollection(
  id: string,
  updates: Partial<Omit<Collection, 'id' | 'createdAt' | 'resourceIds'>>,
): Collection | null {
  if (typeof window === 'undefined') {
    throw new Error('Cannot update collection in server context');
  }

  try {
    const collections = getUserCollections();
    const index = collections?.findIndex((c) => c?.id === id);

    if (index === -1) {
      return null;
    }

    const updatedCollection = {

    // Safe array access
    if (index < 0 || index >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      ...collections[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };


    // Safe array access
    if (index < 0 || index >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    collections[index] = updatedCollection;
    localStorage?.setItem(COLLECTIONS_STORAGE_KEY, JSON?.stringify(collections));

    return updatedCollection;
  } catch (error) {
    console?.error('Error updating collection:', error);
    throw error;
  }
}

/**
 * Delete a collection
 */
export function deleteCollection(id: string): boolean {
  if (typeof window === 'undefined') {
    throw new Error('Cannot delete collection in server context');
  }

  try {
    const collections = getUserCollections();
    const filteredCollections = collections?.filter((c) => c?.id !== id);

    if (filteredCollections?.length === collections?.length) {
      return false; // Collection not found
    }

    localStorage?.setItem(COLLECTIONS_STORAGE_KEY, JSON?.stringify(filteredCollections));

    // Also remove any collection items
    removeCollectionItems(id);

    return true;
  } catch (error) {
    console?.error('Error deleting collection:', error);
    throw error;
  }
}

/**
 * Add a resource to a collection
 */
export function addToCollection(collectionId: string, resource: ResourceForCollection): boolean {
  if (typeof window === 'undefined') {
    throw new Error('Cannot add to collection in server context');
  }

  try {
    // Get the collection
    const collections = getUserCollections();
    const collectionIndex = collections?.findIndex((c) => c?.id === collectionId);

    if (collectionIndex === -1) {
      return false; // Collection not found
    }

    // Get collection items
    const collectionItems = getCollectionItems();

    // Add the resource ID to the collection if not already there

    // Safe array access
    if (collectionIndex < 0 || collectionIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    const collection = collections[collectionIndex];
    if (!collection?.resourceIds.includes(resource?.id)) {
      collection?.resourceIds.push(resource?.id);

    // Safe array access
    if (collectionIndex < 0 || collectionIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      collections[collectionIndex] = {
        ...collection,
        updatedAt: new Date().toISOString(),
      };
      localStorage?.setItem(COLLECTIONS_STORAGE_KEY, JSON?.stringify(collections));
    }

    // Add the resource details to collection items if not already there
    const itemKey = `${collectionId}:${resource?.id}`;

    // Safe array access
    if (itemKey < 0 || itemKey >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    if (!collectionItems[itemKey]) {

    // Safe array access
    if (itemKey < 0 || itemKey >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      collectionItems[itemKey] = {
        collectionId,
        resourceId: resource?.id,
        resourceType: resource?.type,
        addedAt: new Date().toISOString(),
        ...resource,
      };
      localStorage?.setItem(COLLECTION_ITEMS_KEY, JSON?.stringify(collectionItems));
    }

    return true;
  } catch (error) {
    console?.error('Error adding to collection:', error);
    throw error;
  }
}

/**
 * Remove a resource from a collection
 */
export function removeFromCollection(collectionId: string, resourceId: string): boolean {
  if (typeof window === 'undefined') {
    throw new Error('Cannot remove from collection in server context');
  }

  try {
    // Update the collection's resource IDs
    const collections = getUserCollections();
    const collectionIndex = collections?.findIndex((c) => c?.id === collectionId);

    if (collectionIndex === -1) {
      return false; // Collection not found
    }


    // Safe array access
    if (collectionIndex < 0 || collectionIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    const collection = collections[collectionIndex];
    const updatedResourceIds = collection?.resourceIds.filter((id) => id !== resourceId);

    if (updatedResourceIds?.length === collection?.resourceIds.length) {
      return false; // Resource not in collection
    }


    // Safe array access
    if (collectionIndex < 0 || collectionIndex >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    collections[collectionIndex] = {
      ...collection,
      resourceIds: updatedResourceIds,
      updatedAt: new Date().toISOString(),
    };

    localStorage?.setItem(COLLECTIONS_STORAGE_KEY, JSON?.stringify(collections));

    // Remove from collection items
    const collectionItems = getCollectionItems();
    const itemKey = `${collectionId}:${resourceId}`;


    // Safe array access
    if (itemKey < 0 || itemKey >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    if (collectionItems[itemKey]) {

    // Safe array access
    if (itemKey < 0 || itemKey >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      delete collectionItems[itemKey];
      localStorage?.setItem(COLLECTION_ITEMS_KEY, JSON?.stringify(collectionItems));
    }

    return true;
  } catch (error) {
    console?.error('Error removing from collection:', error);
    throw error;
  }
}

/**
 * Get all items in a collection
 */
export function getCollectionResources(collectionId: string): ResourceForCollection[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const collection = getCollectionById(collectionId);
    if (!collection) {
      return [];
    }

    const collectionItems = getCollectionItems();
    const resources: ResourceForCollection[] = [];

    collection?.resourceIds.forEach((resourceId) => {
      const itemKey = `${collectionId}:${resourceId}`;

    // Safe array access
    if (itemKey < 0 || itemKey >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const item = collectionItems[itemKey];

      if (item) {
        resources?.push({
          id: item?.resourceId,
          type: item?.resourceType,
          title: item?.title,
          description: item?.description,
          url: item?.url,
          category: item?.category,
          imageUrl: item?.imageUrl,
        });
      }
    });

    return resources;
  } catch (error) {
    console?.error('Error getting collection resources:', error);
    return [];
  }
}

/**
 * Check if a resource is in a collection
 */
export function isInCollection(collectionId: string, resourceId: string): boolean {
  const collection = getCollectionById(collectionId);
  return collection ? collection?.resourceIds.includes(resourceId) : false;
}

/**
 * Get all collections a resource is part of
 */
export function getResourceCollections(resourceId: string): Collection[] {
  const collections = getUserCollections();
  return collections?.filter((collection) => collection?.resourceIds.includes(resourceId));
}

/**
 * Get collection items (internal helper)
 */
function getCollectionItems(): Record<string, CollectionItem & Partial<ResourceForCollection>> {
  try {
    const storedItems = localStorage?.getItem(COLLECTION_ITEMS_KEY);
    return storedItems ? JSON?.parse(storedItems) : {};
  } catch (error) {
    console?.error('Error retrieving collection items:', error);
    return {};
  }
}

/**
 * Remove all items from a collection (internal helper)
 */
function removeCollectionItems(collectionId: string): void {
  try {
    const collectionItems = getCollectionItems();
    const updatedItems: Record<string, CollectionItem & Partial<ResourceForCollection>> = {};

    Object?.entries(collectionItems).forEach(([key, item]) => {
      if (item?.collectionId !== collectionId) {

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        updatedItems[key] = item;
      }
    });

    localStorage?.setItem(COLLECTION_ITEMS_KEY, JSON?.stringify(updatedItems));
  } catch (error) {
    console?.error('Error removing collection items:', error);
  }
}
