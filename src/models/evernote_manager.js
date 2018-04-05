import Evernote from 'evernote';
import { DI } from 'evaengine';
import cheerio from 'cheerio';
import EvernoteStrategy from 'passport-evernote/lib/index';

export const ORDERS = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  RELEVANCE: 'RELEVANCE',
  UPDATE_SEQUENCE_NUMBER: 'UPDATE_SEQUENCE_NUMBER',
  TITLE: 'TITLE'
};

const convertTimestamp = ms => Math.floor(ms / 1000);

export class Note {
  static getResourceUrl({
    guid,
    hash,
    hashedResources,
    sandbox,
    sharedKey,
    sharedId
  }) {
    const resource = hashedResources.find(r => r.hash === hash);
    const domain = sandbox ? 'sandbox.evernote.com' : 'www.evernote.com';
    const extension = ({
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif'
    })[resource.mime];
    return `https://${domain}/shard/${sharedId}/sh/${guid}/${sharedKey}/res/${resource.guid}.${extension}`;
  }

  static contentToHtml({
    guid, content, sharedKey, resources
  }) {
    if (!content) {
      return null;
    }
    const dom = cheerio.load(content, { xmlMode: true, decodeEntities: false });
    if (!resources || resources.length < 1) {
      return dom('en-note').html();
    }
    const hashedResources = resources.map(r => ({
      guid: r.guid,
      hash: r.data.bodyHash.toString('hex'),
      mine: r.mime,
      width: r.width,
      height: r.height
    }));
    const config = DI.get('config').get('evernote');
    const { sharedId, sandbox } = config;
    dom('en-media').each((i, media) => {
      const mediaDom = dom(media);
      const hash = mediaDom.attr('hash');
      mediaDom.replaceWith(`<img src="${Note.getResourceUrl({
        guid,
        hashedResources,
        hash,
        sandbox,
        sharedId,
        sharedKey
      })}" />`);
    });
    return dom('en-note').html();
  }

  static async factory({
    rawNote, sharedId, sharedKey, tagNames = []
  }) {
    const {
      guid,
      title,
      content,
      contentHash,
      contentLength,
      created,
      updated,
      deleted,
      active,
      notebookGuid,
      // tagGuids,
      resources
    } = rawNote;
    const publicContent = Note.contentToHtml({
      guid,
      content,
      resources,
      sharedId,
      sharedKey
    });

    const createdAt = convertTimestamp(created);
    const updatedAt = convertTimestamp(updated);
    const deletedAt = deleted ? convertTimestamp(deleted) : 0;
    const status = active ? 'active' : 'inactive';
    return new Note({
      id: guid,
      title,
      status,
      content: publicContent,
      contentHash: contentHash ? contentHash.toString('hex') : null,
      contentLength,
      createdAt,
      updatedAt,
      deletedAt,
      notebookId: notebookGuid,
      tags: tagNames ? tagNames.map(tag => ({ tagName: tag })) : []
    });
  }

  constructor({
    id,
    title,
    content,
    contentHash,
    createdAt,
    updatedAt,
    deletedAt,
    status,
    notebookId,
    tags
  }) {
    this.id = id;
    this.slug = id;
    this.title = title;
    this.codeType = 'html';
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.contentHash = contentHash;
    this.notebookId = notebookId;
    this.text = { content };
    this.tags = tags;
  }
}

export default class EvernoteManager {
  constructor() {
    const config = DI.get('config').get('evernote');
    this.sharedId = config.sharedId;
    this.client = new Evernote.Client({
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      sandbox: config.sandbox,
      china: config.china,
      token: config.token
    });
  }

  static getOAuthStrategy(callbackPath, callback) {
    const config = DI.get('config').get('evernote');
    return new EvernoteStrategy(Object.assign(config.sandbox ? {
      requestTokenURL: 'https://sandbox.evernote.com/oauth',
      accessTokenURL: 'https://sandbox.evernote.com/oauth',
      userAuthorizationURL: 'https://sandbox.evernote.com/OAuth.action'
    } : {}, {
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      callbackURL: `${config.callbackDomain}${callbackPath}`
    }), callback);
  }

  async getUser() {
    return this.client.getUserStore().getUser();
  }

  async getUserUrls() {
    return this.client.getUserStore().getUserUrls();
  }

  async getClient() {
    return this.client;
  }

  async listNotebooks() {
    const noteStore = this.client.getNoteStore();
    return noteStore.listNotebooks();
  }

  /**
   * @param notebookId
   * @param order
   * @param ascending
   * @param offset
   * @param limit
   * @returns {Promise<{total: *, notes: any[]}>}
   */
  async listNotes({
    notebookId,
    order = ORDERS.CREATED,
    ascending = false,
    offset = 0,
    limit = 100
  }) {
    const {
      // startIndex: offset,
      totalNotes: total,
      notes
    } = await this.client.getNoteStore().findNotesMetadata(
      new Evernote.NoteStore.NoteFilter({
        notebookGuid: notebookId || DI.get('config').get('evernote.defaultNotebookId'),
        order,
        ascending
      }),
      offset,
      limit,
      new Evernote.NoteStore.NotesMetadataResultSpec({
        includeTitle: true,
        includeContentLength: true,
        includeCreated: true,
        includeUpdated: true,
        includeDeleted: true,
        includeUpdateSequenceNum: false,
        includeNotebookGuid: true,
        includeTagGuids: true,
        includeAttributes: false,
        includeLargestResourceMime: false,
        includeLargestResourceSize: false
      })
    );
    return {
      total,
      notes: await Promise.all(notes.map(rawNote => Note.factory({ rawNote })))
    };
  }

  async listTags(notebookId) {
    const noteStore = this.client.getNoteStore();
    return notebookId ? noteStore.listTagsByNotebook(notebookId) : noteStore.listTags();
  }

  async shareNote(noteId) {
    return this.client.getNoteStore().shareNote(noteId);
  }

  /**
   * @param noteId
   * @returns {Promise<Note>}
   */
  async getNote(noteId) {
    const noteStore = this.client.getNoteStore();
    const [rawNote, sharedKey, tagNames] = await Promise.all([
      noteStore.getNote(noteId, true, false, true, true),
      noteStore.shareNote(noteId),
      noteStore.getNoteTagNames(noteId)
    ]);
    return Note.factory({
      rawNote, sharedId: this.sharedId, sharedKey, tagNames
    });
  }
}
