
import { OfflineStory } from '../types';

const DB_NAME = 'NtaloDB';
const STORE_NAME = 'stories';
const IMAGE_STORE_NAME = 'images';
const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;
let connectionPending: Promise<IDBDatabase> | null = null;

const initDB = (): Promise<IDBDatabase> => {
  // If we have a valid instance, return it
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  // If a connection is already in progress, return that promise
  if (connectionPending) {
    return connectionPending;
  }

  connectionPending = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'title' });
      }
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME); // Key is string (cacheKey), Value is base64
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      dbInstance = db;
      connectionPending = null;

      // Reset instance if connection closes unexpectedly
      db.onclose = () => {
        dbInstance = null;
      };
      
      db.onversionchange = () => {
        db.close();
        dbInstance = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      connectionPending = null;
      dbInstance = null;
      reject(request.error);
    };
  });

  return connectionPending;
};

// --- Story Operations ---

export const saveStoryToOffline = async (story: OfflineStory): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(story);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (e) {
      // Retry once if transaction fails due to closure
      if (dbInstance) {
          dbInstance = null;
          saveStoryToOffline(story).then(resolve).catch(reject);
      } else {
          reject(e);
      }
    }
  });
};

export const getOfflineStory = async (title: string): Promise<OfflineStory | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(title);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    } catch (e) {
        if (dbInstance) {
            dbInstance = null;
            getOfflineStory(title).then(resolve).catch(reject);
        } else {
            reject(e);
        }
    }
  });
};

export const getAllOfflineStories = async (): Promise<OfflineStory[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    } catch (e) {
        if (dbInstance) {
            dbInstance = null;
            getAllOfflineStories().then(resolve).catch(reject);
        } else {
            reject(e);
        }
    }
  });
};

export const isStoryDownloaded = async (title: string): Promise<boolean> => {
  const story = await getOfflineStory(title);
  return !!story;
};

// --- Image Caching Operations ---

export const cacheImage = async (key: string, base64Data: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    try {
        const transaction = db.transaction(IMAGE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(IMAGE_STORE_NAME);
        const request = store.put(base64Data, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    } catch (e) {
        if (dbInstance) {
            dbInstance = null;
            cacheImage(key, base64Data).then(resolve).catch(reject);
        } else {
            reject(e);
        }
    }
  });
};

export const getCachedImage = async (key: string): Promise<string | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    try {
        const transaction = db.transaction(IMAGE_STORE_NAME, 'readonly');
        const store = transaction.objectStore(IMAGE_STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    } catch (e) {
        if (dbInstance) {
            dbInstance = null;
            getCachedImage(key).then(resolve).catch(reject);
        } else {
            reject(e);
        }
    }
  });
};
