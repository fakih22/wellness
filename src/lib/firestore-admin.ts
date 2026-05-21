import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

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

// Get Firestore instance
export function getDb() {
  return getFirestore();
}

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

// Generic CRUD operations using Firebase Admin SDK
export async function createDocument(collectionName: string, data: any) {
  const db = getDb();
  const docRef = await db.collection(collectionName).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function createDocumentWithId(collectionName: string, docId: string, data: any) {
  const db = getDb();
  await db.collection(collectionName).doc(docId).set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docId;
}

export async function getDocument(collectionName: string, docId: string) {
  const db = getDb();
  const docSnap = await db.collection(collectionName).doc(docId).get();
  
  if (docSnap.exists) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function updateDocument(collectionName: string, docId: string, data: any) {
  const db = getDb();
  await db.collection(collectionName).doc(docId).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteDocument(collectionName: string, docId: string) {
  const db = getDb();
  await db.collection(collectionName).doc(docId).delete();
}

// Query helpers
export async function queryDocuments(
  collectionName: string,
  filters: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[] = [],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
) {
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection(collectionName);
  
  // Apply filters
  filters.forEach(filter => {
    query = query.where(filter.field, filter.operator, filter.value);
  });
  
  // Apply ordering
  if (orderByField) {
    query = query.orderBy(orderByField, orderDirection);
  }
  
  // Apply limit
  if (limitCount) {
    query = query.limit(limitCount);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
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
  return queryDocuments(
    collectionName,
    [{ field: 'userId', operator: '==', value: userId }],
    orderByField,
    orderDirection,
    limitCount
  );
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
  const db = getDb();
  await db.collection(COLLECTIONS.WATER_LOGS).doc(docId).set({
    userId,
    amount: 0,
    date: Timestamp.fromDate(startOfDay),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  
  return getDocument(COLLECTIONS.WATER_LOGS, docId);
}

// Helper for updating water log (adds to existing amount)
export async function updateWaterLog(userId: string, date: Date, amount: number) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const dateString = startOfDay.toISOString().split('T')[0];
  const docId = `${userId}_${dateString}`;
  
  const db = getDb();
  
  // Get existing water log
  const existingDoc = await db.collection(COLLECTIONS.WATER_LOGS).doc(docId).get();
  const currentAmount = existingDoc.exists ? (existingDoc.data()?.amount || 0) : 0;
  const newAmount = currentAmount + amount;
  
  // Prevent negative total water intake
  if (newAmount < 0) {
    throw new Error('Cannot reduce water intake below zero');
  }
  
  await db.collection(COLLECTIONS.WATER_LOGS).doc(docId).set({
    userId,
    amount: newAmount,
    date: Timestamp.fromDate(startOfDay),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  
  return getDocument(COLLECTIONS.WATER_LOGS, docId);
}
