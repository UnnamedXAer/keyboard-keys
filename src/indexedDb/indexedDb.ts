import type { PhraseTestSummary } from '../helpers/stats';

export class LocalDb {
  private static _instance: LocalDb;
  private readonly phraseSummaryStoreName = 'phrase-summary' as const;
  private readonly version = 1 as const;
  private readonly dbName = 'keyboarding-db' as const;
  private _db?: IDBDatabase;
  //   _this = this;

  private get db() {
    if (!this._db) throw Error('database must be opened first to use it, see `openDb`');
    return this._db;
  }

  constructor() {
    if (!LocalDb._instance) {
      LocalDb._instance = this;
    }
    return LocalDb._instance;
  }

  open(): Promise<void> {
    if (this._db) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const requestOpenDb = indexedDB.open(this.dbName, this.version);

      requestOpenDb.onupgradeneeded = (ev) => {
        const db = requestOpenDb.result;
        // triggered when user had no database
        // .. perform initialization

        // requestOpenDb.result
        db.createObjectStore('phrase-summary', {
          // autoIncrement: true,
          keyPath: 'createdAt' satisfies keyof PhraseTestSummary,
        });
      };

      requestOpenDb.onerror = (ev) => {
        console.log('IDBOpenDBRequest: error: ', requestOpenDb.error);
        if (requestOpenDb.result.version < LocalDb._instance.version) {
          alert(
            'You have old javascript loaded, the website needs to be reloaded to \
		work correctly. Use Ctrl+F5 to discard cached filed force load new ones.'
          );
        }

        reject(requestOpenDb.error);
      };

      requestOpenDb.onsuccess = (ev) => {
        console.log('IDBOpenDBRequest: result: ', requestOpenDb.result);
        this._db = requestOpenDb.result;

        this.db.onversionchange = (ev) => {
          this.db.close();
          alert('Database is outdated and it will be closed, please reload the page.');
        };

        resolve();
      };

      requestOpenDb.onblocked = (ev) => {
        console.log('IDBOpenDBRequest: blocked: ', requestOpenDb);
        alert(
          'Database is cannot be opened, because older version is running in one of your \
		tabs, please close it and reload the page.'
        );
      };
    });
  }

  close() {
    this.db.close();
  }

  writePhraseSummary(data: PhraseTestSummary) {
    return new Promise<string>((resolve, reject) => {
      const transation = this.db.transaction(this.phraseSummaryStoreName, 'readwrite');
      transation.onerror = (ev) => {
        ev.stopPropagation();
        reject(request.error);
      };

      transation.onabort = (ev) => {
        console.log('transaction abort', data, ev);
      };

      const store = transation.objectStore(this.phraseSummaryStoreName);

      const request = store.add(data);

      request.onerror = (ev) => {
        if (request.error?.name == 'ConstraintError') {
          ev.stopPropagation();
          ev.preventDefault();
          transation.abort();
          data.createdAt.setTime(data.createdAt.getTime() + 1);
          resolve(this.writePhraseSummary(data));
          return;
        }
      };

      request.onsuccess = (ev) => {
        resolve(request.result.toString());
      };
    });
  }

  getPhraseSummaries(limit = 10) {
    return new Promise<PhraseTestSummary[]>((resolve, reject) => {
      const transation = this.db.transaction(this.phraseSummaryStoreName, 'readonly');
      transation.onerror = (ev) => {
        ev.stopPropagation;
        reject(request.error);
      };

      const store = transation.objectStore(this.phraseSummaryStoreName);

      const request = store.getAll(void 0, limit);

      request.onsuccess = (ev) => {
        resolve(request.result);
      };
    });
  }

  deletePhraseSummary(createdAt: PhraseTestSummary['createdAt']): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const transation = this.db.transaction(this.phraseSummaryStoreName, 'readonly');
      transation.onerror = (ev) => {
        ev.stopPropagation;
        reject(request.error);
      };

      const store = transation.objectStore(this.phraseSummaryStoreName);

      const request = store.delete(IDBKeyRange.only(createdAt));

      request.onsuccess = (ev) => {
        resolve();
      };
    });
  }
}
