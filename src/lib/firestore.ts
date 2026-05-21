import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  WhereFilterOp,
  QueryConstraint,
  DocumentData,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  MOODS: 'moods',
  WATER_LOGS: 'water_logs',
  SLEEP_LOGS: 'sleep_logs',
  EXERCISE_LOGS: 'exercise_logs',
  HABITS: 'habits',
  GOALS: 'goals',
  JOURNALS: 'journals',
  ACHIEVEMENTS: 'achievements',
};

// Helper to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}

// Helper to convert Date to Firestore Timestamp
export function dateToTimestamp(date: Date | string): Timestamp {
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date));
  }
  return Timestamp.fromDate(date);
}

// Generic CRUD operations
export async function createDocument(collectionName: string, data: any) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function createDocumentWithId(collectionName: string, docId: string, data: any) {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docId;
}

export async function getDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function updateDocument(collectionName: string, docId: string, data: any) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// Query helpers
export async function queryDocuments(
  collectionName: string,
  constraints: QueryConstraint[]
) {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getDocumentsByUserId(
  collectionName: string,
  userId: string,
  orderByField: string = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
) {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy(orderByField, orderDirection),
  ];
  
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  return queryDocuments(collectionName, constraints);
}

export async function getDocumentsByUserIdAndDateRange(
  collectionName: string,
  userId: string,
  startDate: Date,
  endDate: Date,
  dateField: string = 'createdAt'
) {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    where(dateField, '>=', Timestamp.fromDate(startDate)),
    where(dateField, '<=', Timestamp.fromDate(endDate)),
    orderBy(dateField, 'desc'),
  ];
  
  return queryDocuments(collectionName, constraints);
}

// Specific helper for water logs (unique per user per day)
export async function getOrCreateWaterLog(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const dateString = startOfDay.toISOString().split('T')[0];
  const docId = `${userId}_${dateString}`;
  
  const existingDoc = await getDocument(COLLECTIONS.WATER_LOGS, docId);
  
  if (existingDoc) {
    return existingDoc;
  }
  
  // Create new water log
  await createDocumentWithId(COLLECTIONS.WATER_LOGS, docId, {
    userId,
    amount: 0,
    date: Timestamp.fromDate(startOfDay),
  });
  
  return getDocument(COLLECTIONS.WATER_LOGS, docId);
}

// Helper for updating water log (adds to existing amount)
export async function updateWaterLog(userId: string, date: Date, amount: number) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const dateString = startOfDay.toISOString().split('T')[0];
  const docId = `${userId}_${dateString}`;
  
  try {
    // Get existing water log with retry
    let existingLog = null;
    let retries = 3;
    
    while (retries > 0) {
      try {
        existingLog = await getDocument(COLLECTIONS.WATER_LOGS, docId);
        break;
      } catch (error: any) {
        retries--;
        if (retries === 0) throw error;
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const currentAmount = (existingLog as any)?.amount || 0;
    const newAmount = currentAmount + amount;
    
    // Save with retry
    retries = 3;
    while (retries > 0) {
      try {
        await setDoc(doc(db, COLLECTIONS.WATER_LOGS, docId), {
          userId,
          amount: newAmount,
          date: Timestamp.fromDate(startOfDay),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        break;
      } catch (error: any) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return getDocument(COLLECTIONS.WATER_LOGS, docId);
  } catch (error: any) {
    console.error('updateWaterLog error:', error);
    throw new Error(`Failed to update water log: ${error.message}`);
  }
}
