import {
  LearnerNodeState,
  EvidenceEntry,
  ActiveTrajectory,
} from '../types';
import {
  INITIAL_LEARNER_NODES,
  INITIAL_EVIDENCE_LOGS,
  INITIAL_ACTIVE_TRAJECTORY,
} from '../data/initialLearnerState';

const DB_NAME = 'PersonalIntelligenceOS_v1';
const DB_VERSION = 1;

const STORES = {
  LEARNER_NODES: 'learner_nodes',
  EVIDENCE_LOGS: 'evidence_logs',
  METADATA: 'system_metadata',
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Open or initialize the IndexedDB database.
 */
export function openOSDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada lingkungan browser ini.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Learner Nodes store (key: nodeId)
      if (!db.objectStoreNames.contains(STORES.LEARNER_NODES)) {
        db.createObjectStore(STORES.LEARNER_NODES, { keyPath: 'nodeId' });
      }

      // 2. Evidence Logs store (key: id, indexed by timestamp & conceptId)
      if (!db.objectStoreNames.contains(STORES.EVIDENCE_LOGS)) {
        const evidenceStore = db.createObjectStore(STORES.EVIDENCE_LOGS, { keyPath: 'id' });
        evidenceStore.createIndex('timestamp', 'timestamp', { unique: false });
        evidenceStore.createIndex('conceptId', 'conceptId', { unique: false });
        evidenceStore.createIndex('retentionStatus', 'retentionStatus', { unique: false });
      }

      // 3. Metadata store (key: key)
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: Event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event: Event) => {
      console.error('Gagal membuka IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Load all learner data from IndexedDB.
 * If IndexedDB is empty, seeds with baseline and returns isFreshDB = true.
 */
export async function loadInitialOSState(): Promise<{
  learnerNodes: Record<string, LearnerNodeState>;
  evidenceLogs: EvidenceEntry[];
  activeTrajectory: ActiveTrajectory;
  isFreshDB: boolean;
}> {
  try {
    const db = await openOSDatabase();

    // Check existing learner nodes
    const savedNodes = await getAllFromStore<LearnerNodeState>(db, STORES.LEARNER_NODES);
    const savedEvidence = await getAllFromStore<EvidenceEntry>(db, STORES.EVIDENCE_LOGS);
    const savedTrajectory = await getFromStore<{ key: string; value: ActiveTrajectory }>(
      db,
      STORES.METADATA,
      'activeTrajectory'
    );

    // If already populated, return real user state
    if (savedNodes.length > 0) {
      const nodesMap: Record<string, LearnerNodeState> = {};
      for (const node of savedNodes) {
        nodesMap[node.nodeId] = node;
      }

      // Sort evidence latest first
      savedEvidence.sort((a, b) => (b.id > a.id ? 1 : -1));

      return {
        learnerNodes: nodesMap,
        evidenceLogs: savedEvidence.length > 0 ? savedEvidence : INITIAL_EVIDENCE_LOGS,
        activeTrajectory: savedTrajectory?.value || INITIAL_ACTIVE_TRAJECTORY,
        isFreshDB: false,
      };
    }

    // Otherwise, first launch on this device: Seed initial baseline into IndexedDB
    await seedBaselineData(db);

    return {
      learnerNodes: INITIAL_LEARNER_NODES,
      evidenceLogs: INITIAL_EVIDENCE_LOGS,
      activeTrajectory: INITIAL_ACTIVE_TRAJECTORY,
      isFreshDB: true,
    };
  } catch (err) {
    console.warn('Fallback ke in-memory state karena IndexedDB error:', err);
    return {
      learnerNodes: INITIAL_LEARNER_NODES,
      evidenceLogs: INITIAL_EVIDENCE_LOGS,
      activeTrajectory: INITIAL_ACTIVE_TRAJECTORY,
      isFreshDB: false,
    };
  }
}

/**
 * Seed initial baseline data into IndexedDB so the app has working initial state.
 */
async function seedBaselineData(db: IDBDatabase): Promise<void> {
  const tx = db.transaction(
    [STORES.LEARNER_NODES, STORES.EVIDENCE_LOGS, STORES.METADATA],
    'readwrite'
  );

  const nodeStore = tx.objectStore(STORES.LEARNER_NODES);
  for (const node of Object.values(INITIAL_LEARNER_NODES)) {
    nodeStore.put(node);
  }

  const evidenceStore = tx.objectStore(STORES.EVIDENCE_LOGS);
  for (const entry of INITIAL_EVIDENCE_LOGS) {
    evidenceStore.put(entry);
  }

  const metaStore = tx.objectStore(STORES.METADATA);
  metaStore.put({ key: 'activeTrajectory', value: INITIAL_ACTIVE_TRAJECTORY });
  metaStore.put({ key: 'initDate', value: new Date().toISOString() });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Persist or update a single learner node in IndexedDB.
 */
export async function persistLearnerNode(node: LearnerNodeState): Promise<void> {
  try {
    const db = await openOSDatabase();
    const tx = db.transaction(STORES.LEARNER_NODES, 'readwrite');
    tx.objectStore(STORES.LEARNER_NODES).put(node);
  } catch (err) {
    console.error('Gagal menyimpan LearnerNode ke IndexedDB:', err);
  }
}

/**
 * Persist multiple learner nodes in batch.
 */
export async function persistAllLearnerNodes(nodes: Record<string, LearnerNodeState>): Promise<void> {
  try {
    const db = await openOSDatabase();
    const tx = db.transaction(STORES.LEARNER_NODES, 'readwrite');
    const store = tx.objectStore(STORES.LEARNER_NODES);
    for (const node of Object.values(nodes)) {
      store.put(node);
    }
  } catch (err) {
    console.error('Gagal menyimpan batch LearnerNodes ke IndexedDB:', err);
  }
}

/**
 * Append a new evidence log to IndexedDB.
 */
export async function persistEvidenceLog(entry: EvidenceEntry): Promise<void> {
  try {
    const db = await openOSDatabase();
    const tx = db.transaction(STORES.EVIDENCE_LOGS, 'readwrite');
    tx.objectStore(STORES.EVIDENCE_LOGS).put(entry);
  } catch (err) {
    console.error('Gagal menyimpan EvidenceEntry ke IndexedDB:', err);
  }
}

/**
 * Persist entire evidence logs array.
 */
export async function persistAllEvidenceLogs(entries: EvidenceEntry[]): Promise<void> {
  try {
    const db = await openOSDatabase();
    const tx = db.transaction(STORES.EVIDENCE_LOGS, 'readwrite');
    const store = tx.objectStore(STORES.EVIDENCE_LOGS);
    for (const entry of entries) {
      store.put(entry);
    }
  } catch (err) {
    console.error('Gagal menyimpan seluruh EvidenceLogs ke IndexedDB:', err);
  }
}

/**
 * Persist Active Trajectory in metadata store.
 */
export async function persistActiveTrajectory(trajectory: ActiveTrajectory): Promise<void> {
  try {
    const db = await openOSDatabase();
    const tx = db.transaction(STORES.METADATA, 'readwrite');
    tx.objectStore(STORES.METADATA).put({ key: 'activeTrajectory', value: trajectory });
  } catch (err) {
    console.error('Gagal menyimpan ActiveTrajectory ke IndexedDB:', err);
  }
}

/**
 * Estimate storage quota and usage from the browser.
 */
export async function getBrowserStorageEstimate(): Promise<{
  usageMb: number;
  quotaMb: number;
  percentageUsed: number;
  isSupported: boolean;
}> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usageMb = (estimate.usage || 0) / (1024 * 1024);
      const quotaMb = (estimate.quota || 0) / (1024 * 1024);
      const percentageUsed = quotaMb > 0 ? (usageMb / quotaMb) * 100 : 0;
      return {
        usageMb: Math.round(usageMb * 100) / 100,
        quotaMb: Math.round(quotaMb),
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        isSupported: true,
      };
    } catch {
      // Ignore
    }
  }

  return {
    usageMb: 0.5,
    quotaMb: 2048,
    percentageUsed: 0.02,
    isSupported: false,
  };
}

/**
 * Export full IndexedDB dataset as JSON for parent data sovereignty and backup.
 */
export async function exportOSDatasetJSON(): Promise<string> {
  const db = await openOSDatabase();
  const nodes = await getAllFromStore<LearnerNodeState>(db, STORES.LEARNER_NODES);
  const evidence = await getAllFromStore<EvidenceEntry>(db, STORES.EVIDENCE_LOGS);
  const trajectory = await getFromStore<{ key: string; value: ActiveTrajectory }>(
    db,
    STORES.METADATA,
    'activeTrajectory'
  );

  const payload = {
    app: 'Arya Personal Intelligence OS',
    version: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    principle: 'Parent Data Sovereignty · Dokumen Fondasi v0.1',
    storageEngine: 'IndexedDB Local Storage',
    nodeCount: nodes.length,
    evidenceCount: evidence.length,
    activeTrajectory: trajectory?.value || INITIAL_ACTIVE_TRAJECTORY,
    learnerNodes: nodes,
    evidenceLogs: evidence,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Import a full JSON backup into IndexedDB.
 */
export async function importOSDatasetJSON(jsonString: string): Promise<{
  success: boolean;
  learnerNodes: Record<string, LearnerNodeState>;
  evidenceLogs: EvidenceEntry[];
  activeTrajectory: ActiveTrajectory;
}> {
  const data = JSON.parse(jsonString);
  if (!data.learnerNodes || !Array.isArray(data.learnerNodes)) {
    throw new Error('Format backup JSON tidak valid: Properti learnerNodes tidak ditemukan.');
  }

  const db = await openOSDatabase();
  const tx = db.transaction(
    [STORES.LEARNER_NODES, STORES.EVIDENCE_LOGS, STORES.METADATA],
    'readwrite'
  );

  // Clear existing
  tx.objectStore(STORES.LEARNER_NODES).clear();
  tx.objectStore(STORES.EVIDENCE_LOGS).clear();

  const nodesMap: Record<string, LearnerNodeState> = {};
  const nodeStore = tx.objectStore(STORES.LEARNER_NODES);
  for (const node of data.learnerNodes) {
    nodeStore.put(node);
    nodesMap[node.nodeId] = node;
  }

  const evidenceList: EvidenceEntry[] = Array.isArray(data.evidenceLogs) ? data.evidenceLogs : [];
  const evidenceStore = tx.objectStore(STORES.EVIDENCE_LOGS);
  for (const entry of evidenceList) {
    evidenceStore.put(entry);
  }

  const trajectory = data.activeTrajectory || INITIAL_ACTIVE_TRAJECTORY;
  const metaStore = tx.objectStore(STORES.METADATA);
  metaStore.put({ key: 'activeTrajectory', value: trajectory });
  metaStore.put({ key: 'lastImportDate', value: new Date().toISOString() });

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return {
    success: true,
    learnerNodes: nodesMap,
    evidenceLogs: evidenceList,
    activeTrajectory: trajectory,
  };
}

/**
 * Reset IndexedDB database to pristine baseline.
 */
export async function resetOSDatabase(): Promise<void> {
  const db = await openOSDatabase();
  const tx = db.transaction(
    [STORES.LEARNER_NODES, STORES.EVIDENCE_LOGS, STORES.METADATA],
    'readwrite'
  );

  tx.objectStore(STORES.LEARNER_NODES).clear();
  tx.objectStore(STORES.EVIDENCE_LOGS).clear();
  tx.objectStore(STORES.METADATA).clear();

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  await seedBaselineData(db);
}

// ---------------- Helper internal queries ---------------- //

function getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function getFromStore<T>(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
