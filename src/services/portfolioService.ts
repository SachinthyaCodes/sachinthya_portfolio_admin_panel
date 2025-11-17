import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Project {
  id?: string;
  title: string;
  description: string;
  content?: string;
  technologies: string[];
  imageUrl?: string;
  images: string[];
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PortfolioService {
  private collectionName = 'projects';

  async getAll(): Promise<Project[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('sortOrder', 'asc'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Project[];
  }

  async getPublished(): Promise<Project[]> {
    const q = query(
      collection(db, this.collectionName),
      where('published', '==', true),
      orderBy('sortOrder', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Project[];
  }

  async getById(id: string): Promise<Project | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Project;
    }
    
    return null;
  }

  async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(id: string, projectData: Partial<Project>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...projectData,
      updatedAt: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}