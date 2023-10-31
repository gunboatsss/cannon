import { CannonLoader, IPFSLoader } from '@usecannon/builder';

import path from 'path';
import fs from 'fs/promises';
import fse from 'fs-extra/esm';
import axios from 'axios';
import crypto from 'crypto';
import { CliSettings } from './settings.js';
import { DEFAULT_REGISTRY_IPFS_ENDPOINT } from './constants.js';
import debug from 'debug';
import { CID } from 'multiformats/cid';

export class LocalLoader implements CannonLoader {
  dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  getLabel(): string {
    return `local (${this.dir})`;
  }

  read(url: string): Promise<any> {
    if (!url.startsWith('file://')) {
      throw new Error('incorrect url type');
    }

    return fse.readJson(path.join(this.dir, `${url.slice(7)}`));
  }

  async put(misc: any): Promise<string | null> {
    const dataToSave = JSON.stringify(misc);
    const hash = crypto.createHash('md5').update(dataToSave).digest('hex');

    await fse.mkdirp(this.dir);
    await fs.writeFile(path.join(this.dir, `${hash}.json`), dataToSave);

    return `file://${hash}.json`;
  }

  async list() {
    debug('local list');

    return (await fs.readdir(this.dir)).filter((f) => f.match(/[0-9a-f]+\.json/)).map((f) => `file://${f}`);
  }

  async remove(url: string) {
    debug(`local remove ${url}`);

    await fs.unlink(path.join(this.dir, `${url.slice(7)}`));
  }
}

export class IPFSOverCDSLoader implements CannonLoader {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  getLabel(): string {
    return `ipfs-over-cds (${this.url})`;
  }

  async readNode(cid: CID): Promise<Uint8Array> {
    const { base32 } = await import('multiformats/bases/base32');

    const contentHash = base32.encode(cid.bytes);

    // get list of blocks
    const blocksData = await axios.get(this.url + '/' + contentHash);

    const dagPB = await import('@ipld/dag-pb');
    const node = dagPB.decode(blocksData.data);

    if (node.Data) {
      return node.Data;
    } else {
      const results: Uint8Array[] = await Promise.all(node.Links.map((l) => this.readNode(l.Hash)));

      // not sure why but we have to manually merge uint8arrays in javascript
      // https://stackoverflow.com/questions/49129643/how-do-i-merge-an-array-of-uint8arrays
      // Get the total length of all arrays.
      let length = 0;
      results.forEach((item: Uint8Array) => {
        length += item.length;
      });

      // Create a new array with total length and merge all source arrays.
      const mergedArray = new Uint8Array(length);
      let offset = 0;
      results.forEach((item) => {
        mergedArray.set(item, offset);
        offset += item.length;
      });

      return mergedArray;
    }
  }

  async read(url: string): Promise<any> {
    if (!url.startsWith('ipfs://')) {
      throw new Error('incorrect url type');
    }

    const { CID } = await import('multiformats/cid');
    const cid = CID.parse(url);

    const compressedData = await this.readNode(cid);

    const pako = await import('pako');

    return JSON.parse(pako.inflate(compressedData, { to: 'string' }));
  }

  async put(): Promise<string | null> {
    throw new Error('cannot publish to cds, please use IPFSLoader');
  }

  async remove() {
    throw new Error('cannot remove from cds');
  }
}

export class CannonRepoLoader extends IPFSLoader {
  email: string;

  constructor(email: string) {
    const url = `https://srv${Math.floor(Math.random() * 20)}.repo.usecannon.com`;
    super(url);

    this.email = email;
  }

  getLabel(): string {
    // todo: obfuscate the ultimate receiver part of the email, and show the rest
    // ex: s***@synthetix.io
    // ex: a***@gmail.com
    return `cannon-repo-ipfs (${this.email ? 'email set' : 'email unset'})`;
  }

  async put(data: any): Promise<string | null> {
    if (!this.email) {
      console.log('Congrats on publishing your first package!');
      console.log();
      console.log('Before we continue, you must setup IPFS hosting for your artifacts.');
      console.log(
        'If you do not already have IPFS service in mind, the Cannon team provides the "Cannon Repo" service, which is a convenient IPFS hosting service specifically for cannon packages. This service will host your IPFS artifacts for up to 90 days for free, and forever if you provide payment (for more info see ...)'
      );
      console.log();
      console.log(
        'If you have another IPFS, feel free to press Control-C now and run `cannon setup` to set your `publishIpfsUrl` setting.'
      );
      console.log();
      console.log(
        'To get started, please enter your email to associate with your Cannon package (this is only used for mail/notifications, and is not shared with anyone. Feel free to set up a one-use email account if thats what you desire. Just make sure to check the email from time to time):'
      );

      // prompt the user
      console.log('You should now receive a confirmation email. Please enter the code you received:');
      // prompt the user

      // set this.email, save to config their email
      console.log('Thanks! Lets publish your package...');
    }

    this.customHeaders = { 'x-cannon-user': this.email };

    return super.put(data);
  }
}

export function getMainLoader(cliSettings: CliSettings) {
  return {
    ipfs: new IPFSLoader(cliSettings.ipfsUrl || DEFAULT_REGISTRY_IPFS_ENDPOINT),
    file: new LocalLoader(path.join(cliSettings.cannonDirectory, 'blobs')),
  };
}
