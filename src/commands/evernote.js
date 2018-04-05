import { Command, DI } from 'evaengine';
import EvernoteManager from '../models/evernote_manager';

export class EvernoteShowNotebooks extends Command { //eslint-disable-line
  static getName() {
    return 'evernote:notebooks';
  }

  static getDescription() {
    return 'Show evernote notebooks';
  }

  static getSpec() {
    return {};
  }

  async run() {
    const logger = DI.get('logger');
    const evernoteManager = new EvernoteManager();
    const notebooks = await evernoteManager.listNotebooks();
    logger.info(notebooks);
  }
}

