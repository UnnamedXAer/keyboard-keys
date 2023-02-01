import type { Nullable } from 'vitest';
import { PhraseTestSummary } from '../helpers/stats';
import { Settings } from '../models/settings';
import type { UserText } from '../models/userText';

export class LocalDb {
  private static _instance: LocalDb;
  private readonly phraseSummaryStoreName = 'phrase-summary' as const;
  private readonly userTextStoreName = 'user-text' as const;
  private readonly settingsStoreName = 'settings' as const;
  private readonly version = 3 as const;
  private readonly dbName = 'keyboarding-db' as const;
  private _db: IDBDatabase | null = null;

  private get db() {
    if (this._db === null) {
      throw Error('database must be opened first to use it, see `open`');
    }
    return this._db;
  }

  public get isOpened() {
    return this._db != null;
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
        const v0 = (db: IDBDatabase) => {
          db.createObjectStore(this.phraseSummaryStoreName, {
            keyPath: 'createdAt' satisfies keyof PhraseTestSummary,
          });
        };

        const v1 = (db: IDBDatabase) => {
          db.createObjectStore(this.userTextStoreName, {
            autoIncrement: true,
          });
        };

        const v2 = (db: IDBDatabase) => {
          db.createObjectStore(this.settingsStoreName, {
            autoIncrement: false,
          });
        };

        const db = requestOpenDb.result;
        // debugger;
        switch (ev.oldVersion) {
          case 0:
            v0(db);
          // eslint-disable-next-line no-fallthrough
          case 1:
            v1(db);
          // eslint-disable-next-line no-fallthrough
          case 2:
            v2(db);
        }
      };

      requestOpenDb.onerror = (ev) => {
        console.log('IDBOpenDBRequest: error: ', requestOpenDb.error);
        if (
          (ev.target as IDBOpenDBRequest | null)?.result &&
          (ev.target as IDBOpenDBRequest).result.version < LocalDb._instance.version
        ) {
          alert(
            'You have old javascript loaded, the website needs to be reloaded to \
		work correctly. Use Ctrl+F5 to discard cached filed force load new ones.'
          );
        }

        reject((requestOpenDb ?? ev.target ?? this.db)?.error);
      };

      requestOpenDb.onsuccess = (ev) => {
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
    this._db?.close();
    this._db = null;
  }

  writePhraseSummary(data: PhraseTestSummary) {
    return new Promise<Date>((resolve, reject) => {
      const transaction = this.db.transaction(this.phraseSummaryStoreName, 'readwrite');
      transaction.onerror = (ev) => {
        ev.stopPropagation();
        reject(request.error);
      };

      transaction.onabort = (ev) => {
        console.log('transaction abort', data, ev);
      };

      const store = transaction.objectStore(this.phraseSummaryStoreName);

      const request = store.add(data);

      request.onerror = (ev) => {
        if (request.error?.name == 'ConstraintError') {
          ev.stopPropagation();
          ev.preventDefault();
          transaction.abort();
          data.createdAt.setTime(data.createdAt.getTime() + 1);
          resolve(this.writePhraseSummary(data));
          return;
        }
      };

      request.onsuccess = (ev) => {
        resolve(request.result as Date);
      };
    });
  }

  getPhraseSummaries(limit = 10) {
    return new Promise<PhraseTestSummary[]>((resolve, reject) => {
      const transaction = this.db.transaction(this.phraseSummaryStoreName, 'readonly');
      transaction.onerror = (ev) => {
        ev.stopPropagation;
        reject(request.error);
      };

      const store = transaction.objectStore(this.phraseSummaryStoreName);

      const request = store.getAll(void 0, limit);

      request.onsuccess = (ev) => {
        resolve(request.result.map((x) => new PhraseTestSummary(x)));
      };
    });
  }

  deletePhraseSummary(createdAt: PhraseTestSummary['createdAt']): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db.transaction(this.phraseSummaryStoreName, 'readwrite');
      transaction.onerror = (ev) => {
        ev.stopPropagation;
        reject(request.error);
      };

      const store = transaction.objectStore(this.phraseSummaryStoreName);

      const request = store.delete(IDBKeyRange.only(createdAt));

      request.onsuccess = (ev) => {
        resolve();
      };
    });
  }

  getUserTexts(): Promise<UserText[]> {
    return new Promise<UserText[]>((resolve, reject) => {
      const transaction = this.db.transaction(this.userTextStoreName, 'readonly');
      transaction.onerror = (ev) => {
        ev.stopPropagation();
        reject(transaction.error);
      };
      const data: UserText[] = [];

      const store = transaction.objectStore(this.userTextStoreName);

      const request = store.openCursor();

      request.onsuccess = (ev) => {
        const cursor = request.result;
        if (cursor === null) {
          return resolve(data);
        }

        data.push({
          key: cursor.key as number,
          text: cursor.value,
        });

        cursor.continue();
      };
      request.onerror = (ev) => {
        ev.stopPropagation();
        reject(request.error);
      };
    });
  }

  saveUserText(text: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.userTextStoreName, 'readwrite');
      transaction.onerror = (ev) => {
        ev.stopPropagation();
        reject(request.error);
      };

      transaction.onabort = (ev) => {
        console.log('saveUserText: transaction abort', ev);
      };

      const store = transaction.objectStore(this.userTextStoreName);

      const request = store.add(text);

      request.onerror = (ev) => {
        if (request.error?.name == 'ConstraintError') {
          ev.stopPropagation();
          ev.preventDefault();
          transaction.abort();
          reject((request || ev.target || this.db)?.error);
          return;
        }
      };

      request.onsuccess = (ev) => {
        resolve(request.result as number);
      };
    });
  }

  deleteUserText(key: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db.transaction(this.userTextStoreName, 'readwrite');
      transaction.onerror = (ev) => {
        ev.stopPropagation();
        reject(request.error);
      };

      const store = transaction.objectStore(this.userTextStoreName);

      const request = store.delete(IDBKeyRange.only(key));

      request.onsuccess = (ev) => {
        resolve();
      };
    });
  }

  updateUserText(key: number, text: string) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.userTextStoreName, 'readwrite');
      transaction.onerror = (ev) => {
        ev.stopPropagation();
        reject(request.error);
      };

      transaction.onabort = (ev) => {
        console.log('updateUserText: transaction abort', ev);
      };

      const store = transaction.objectStore(this.userTextStoreName);

      const request = store.put(text, key);

      request.onerror = (ev) => {
        if (request.error?.name == 'ConstraintError') {
          ev.stopPropagation();
          ev.preventDefault();
          transaction.abort();
          reject((request || ev.target || this.db)?.error);
          return;
        }
      };

      request.onsuccess = (ev) => {
        resolve(request.result);
      };
    });
  }

  getSettings() {
    return new Promise<Settings>((resolve, reject) => {
      const transaction = this.db.transaction(this.settingsStoreName, 'readonly');
      transaction.onerror = (ev) => {
        ev.stopPropagation();
        reject(request.error);
      };

      transaction.onabort = (ev) => {
        console.log('get settings: transaction abort', ev);
      };

      const store = transaction.objectStore(this.settingsStoreName);

      const request = store.get(1);

      request.onerror = (ev) => {
        ev.stopPropagation();
        reject((request || ev.target || this.db)?.error);
        return;
      };

      request.onsuccess = (ev) => {
        const settings = new Settings((request.result as Nullable<Partial<Settings>>) || {});
        resolve(settings);
      };
    });
  }

  updateSettings(settings: Settings) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.settingsStoreName, 'readwrite');
      transaction.onerror = (ev) => {
        ev.stopPropagation();
        reject(request.error);
      };

      transaction.onabort = (ev) => {
        console.log('update settings: transaction abort', ev);
      };

      const store = transaction.objectStore(this.settingsStoreName);

      const request = store.put(settings, 1);

      request.onerror = (ev) => {
        if (request.error?.name == 'ConstraintError') {
          ev.stopPropagation();
          ev.preventDefault();
          transaction.abort();
          reject((request || ev.target || this.db)?.error);
          return;
        }
      };

      request.onsuccess = (ev) => {
        resolve(request.result);
      };
    });
  }
}
