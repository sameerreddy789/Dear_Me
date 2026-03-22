import { db, getCurrentUser } from './auth.js';

export async function saveEntry(entryData, existingEntryId = null) {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const now = firebase.firestore.Timestamp.now();
    
    const entry = {
        userId: user.uid,
        date: firebase.firestore.Timestamp.fromDate(entryData.date),
        title: entryData.title.trim(),
        content: entryData.content,
        mood: entryData.mood,
        images: entryData.images || [],
        drawingURL: entryData.drawingURL || null,
        theme: entryData.theme || 'pastel-pink',
        updatedAt: now
    };
    
    if (existingEntryId) {
        // Update existing entry
        const entryRef = db.collection('entries').doc(existingEntryId);
        await entryRef.update(entry);
        return existingEntryId;
    } else {
        // Create new entry
        entry.createdAt = now;
        const entryRef = await db.collection('entries').add(entry);
        
        // Update user streak
        await updateStreak(user.uid, entryData.date);
        
        return entryRef.id;
    }
}

async function updateStreak(userId, entryDate) {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const lastEntryDate = userData.lastEntryDate?.toDate();
    const currentStreak = userData.streak || 0;
    const longestStreak = userData.longestStreak || 0;
    
    let newStreak = 1;
    
    if (lastEntryDate) {
        const daysDiff = Math.floor((entryDate - lastEntryDate) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
            newStreak = currentStreak + 1;
        } else if (daysDiff === 0) {
            newStreak = currentStreak;
        }
    }
    
    await userRef.update({
        streak: newStreak,
        longestStreak: Math.max(longestStreak, newStreak),
        lastEntryDate: firebase.firestore.Timestamp.fromDate(entryDate)
    });
}

export async function getEntry(entryId) {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const entryRef = db.collection('entries').doc(entryId);
    const entryDoc = await entryRef.get();
    
    if (!entryDoc.exists) {
        throw new Error('Entry not found');
    }
    
    const data = entryDoc.data();
    
    if (data.userId !== user.uid) {
        throw new Error('Permission denied');
    }
    
    return {
        id: entryDoc.id,
        ...data
    };
}

export async function getRecentEntries(limit = 5) {
    const user = getCurrentUser();
    if (!user) return [];
    
    try {
        const snapshot = await db.collection('entries')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.warn('Index not ready, fetching all entries:', error);
        const snapshot = await db.collection('entries')
            .where('userId', '==', user.uid)
            .get();
        
        const entries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        entries.sort((a, b) => b.date.toMillis() - a.date.toMillis());
        return entries.slice(0, limit);
    }
}

export async function getEntriesForMonth(year, month) {
    const user = getCurrentUser();
    if (!user) return [];
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    
    try {
        const snapshot = await db.collection('entries')
            .where('userId', '==', user.uid)
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startDate))
            .where('date', '<=', firebase.firestore.Timestamp.fromDate(endDate))
            .orderBy('date', 'asc')
            .get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                date: data.date.toDate(),
                title: data.title,
                mood: data.mood,
                content: data.content
            };
        });
    } catch (error) {
        console.warn('Index not ready, filtering client-side:', error);
        const snapshot = await db.collection('entries')
            .where('userId', '==', user.uid)
            .get();
        
        const entries = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    date: data.date.toDate(),
                    title: data.title,
                    mood: data.mood,
                    content: data.content
                };
            })
            .filter(entry => {
                const entryDate = entry.date;
                return entryDate >= startDate && entryDate <= endDate;
            })
            .sort((a, b) => a.date - b.date);
        
        return entries;
    }
}

export async function getEntriesForYear(year) {
    const user = getCurrentUser();
    if (!user) return [];
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    try {
        const snapshot = await db.collection('entries')
            .where('userId', '==', user.uid)
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startDate))
            .where('date', '<=', firebase.firestore.Timestamp.fromDate(endDate))
            .orderBy('date', 'asc')
            .get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                date: data.date.toDate(),
                mood: data.mood
            };
        });
    } catch (error) {
        console.warn('Index not ready, filtering client-side:', error);
        const snapshot = await db.collection('entries')
            .where('userId', '==', user.uid)
            .get();
        
        const entries = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    date: data.date.toDate(),
                    mood: data.mood
                };
            })
            .filter(entry => {
                const entryDate = entry.date;
                return entryDate >= startDate && entryDate <= endDate;
            })
            .sort((a, b) => a.date - b.date);
        
        return entries;
    }
}
