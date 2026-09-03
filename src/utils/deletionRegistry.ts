import { db } from '../lib/firebase';
import { doc, deleteDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { loadFromLocalStorage, saveToLocalStorage } from './helpers';

const DELETED_IDS_STORAGE_KEY = 'kaptan_deleted_item_ids';

/**
 * Returns a Set of all permanently deleted item IDs across the application.
 */
export function getDeletedItemIds(): Set<string> {
  try {
    const saved = loadFromLocalStorage<string[]>(DELETED_IDS_STORAGE_KEY, []);
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
}

/**
 * Checks whether an item ID has been marked as deleted.
 */
export function isItemDeleted(id: string): boolean {
  if (!id) return false;
  const deletedSet = getDeletedItemIds();
  return deletedSet.has(id);
}

/**
 * Permanently marks an item/card as deleted:
 * 1. Persists the deletion in localStorage to prevent resurfacing upon reload or cache re-evaluation.
 * 2. Deletes the physical document from Firestore.
 * 3. Sets a soft-delete tombstone in Firestore as a resilient fallback.
 * 4. Records the tombstone in 'deletedRecords' collection so other connected devices sync the deletion.
 */
export async function markItemAsDeleted(id: string, collectionName: string): Promise<void> {
  if (!id) return;

  // 1. Immediately record in local persistent registry
  const currentSet = getDeletedItemIds();
  currentSet.add(id);
  saveToLocalStorage(DELETED_IDS_STORAGE_KEY, Array.from(currentSet));
  console.log(`🗑️ [DeletionRegistry] Item ${id} marked as deleted in ${collectionName}`);

  // 2. Direct Firestore physical document deletion
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log(`✅ [DeletionRegistry] Successfully removed ${id} from Firestore collection: ${collectionName}`);
  } catch (err: any) {
    console.warn(`⚠️ [DeletionRegistry] Physical delete warning for ${id}:`, err?.message);
    // 3. Fallback: Write soft-delete tombstone if physical delete was prevented
    try {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, { isDeleted: true, status: 'DELETED', deletedAt: new Date().toISOString() }, { merge: true });
    } catch {}
  }

  // 4. Record in central 'deletedRecords' collection for cross-client propagation
  try {
    const tombstoneRef = doc(db, 'deletedRecords', id);
    await setDoc(
      tombstoneRef,
      {
        id,
        collectionName,
        deletedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err: any) {
    console.warn('⚠️ [DeletionRegistry] Global tombstone sync notice:', err?.message);
  }
}

/**
 * Sets up a real-time listener on the Firestore 'deletedRecords' collection
 * to ensure that deletions executed by an admin on any device are mirrored everywhere.
 */
export function listenToGlobalDeletedRecords(onUpdate?: () => void): () => void {
  try {
    const colRef = collection(db, 'deletedRecords');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const currentSet = getDeletedItemIds();
          let changed = false;

          snapshot.forEach((docSnap) => {
            const docId = docSnap.id;
            if (!currentSet.has(docId)) {
              currentSet.add(docId);
              changed = true;
            }
          });

          if (changed) {
            saveToLocalStorage(DELETED_IDS_STORAGE_KEY, Array.from(currentSet));
            if (onUpdate) onUpdate();
          }
        }
      },
      (err) => {
        console.warn('⚠️ [DeletionRegistry] Global deleted records subscription notice:', err?.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}
