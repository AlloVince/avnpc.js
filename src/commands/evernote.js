import { Command, DI } from 'evaengine';
import EvernoteManager from '../models/evernote_manager';

export class EvernoteSync extends Command { //eslint-disable-line
  static getName() {
    return 'evernote:sync';
  }

  static getDescription() {
    return 'Sync evernote ';
  }

  static getSpec() {
    return {};
  }

  async run() {
    const logger = DI.get('logger');
    const evernoteManager = new EvernoteManager();
    const note = await evernoteManager.getNote('00637181-70a6-472a-abee-065bdf7950ad');
    logger.info(note);
  }
}

