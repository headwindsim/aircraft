//  Copyright (c) 2021 FlyByWire Simulations
//  SPDX-License-Identifier: GPL-3.0

import { NXDataStore } from '@flybywiresim/fbw-sdk';
import { Hoppie } from '@flybywiresim/api-client';
import { SayIntentions } from '@headwindsimulations/api-client';
import {
  AcarsNetwork,
  AtsuStatusCodes,
  CpdlcMessage,
  FreetextMessage,
  FansMode,
  CpdlcMessagesUplink,
  CpdlcMessageElement,
  CpdlcMessageContent,
  CpdlcMessageExpectedResponseType,
  AtsuMessage,
  AtsuMessageNetwork,
  AtsuMessageDirection,
  AtsuMessageComStatus,
  AtsuMessageSerializationFormat,
} from '../../../common/src';

/**
 * Defines the connector to the acars network
 */
export class AcarsConnector {
  private static aircraftProjectPrefix: string = process.env.AIRCRAFT_PROJECT_PREFIX.toUpperCase();
  private static flightNumber: string = '';

  private static getIdentifierByNetwork(network: string | AcarsNetwork) {
    let identifier: any;
    switch (network) {
      case AcarsNetwork.Hoppie:
        identifier = NXDataStore.get('CONFIG_ACARS_HOPPIE_USERID');
        break;
      case AcarsNetwork.SayIntentions:
        identifier = NXDataStore.get('CONFIG_ACARS_SAYINTENTIONS_KEY');
        break;
      default:
        identifier = null;
    }
    return identifier;
  }

  public static fansMode: FansMode = FansMode.FansNone;

  public static async validate(service: string | AcarsNetwork, value: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!value || value === '') {
        resolve(value);
      }

      const body = {
        logon: value,
        from: `HDW${this.aircraftProjectPrefix}`,
        to: 'SERVER',
        type: 'ping',
        packet: '',
      };

      switch (service) {
        case AcarsNetwork.Hoppie:
          Hoppie.sendRequest(body)
            .then((resp) => {
              if (resp.response === 'error {invalid logon code}') {
                reject(new Error(`Error: Unknown user ID: ${resp.response}`));
              } else {
                resolve(value);
              }
            })
            .catch((err) => reject(err));
          break;
        case AcarsNetwork.SayIntentions:
          SayIntentions.validateKey(value)
            .then((resp) => {
              if (!resp.isValid) {
                reject(new Error(`Error: API KEY is not valid`));
              } else {
                resolve(value);
              }
            })
            .catch((err) => reject(err));
          break;
        default:
          reject(new Error(`Error: Unknown service "${service}"`));
      }
    });
  }

  public static async activate() {
    SimVar.SetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number', 0);

    const acarsNetwork = NXDataStore.get('CONFIG_ACARS_NETWORK', AcarsNetwork.Disabled);
    if (acarsNetwork === AcarsNetwork.Disabled) {
      console.log('ACARS deactivated in EFB');
      return;
    }

    const identifier = AcarsConnector.getIdentifierByNetwork(acarsNetwork);
    if (!identifier) {
      console.log('No ACARS-ID set');
      return;
    }

    AcarsConnector.validate(acarsNetwork, identifier)
      .then(() => {
        SimVar.SetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number', 1);
      })
      .catch((_error) => {
        console.error(_error);
      });
  }

  public static deactivate(): void {
    SimVar.SetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number', 0);
  }

  public static async connect(flightNo: string): Promise<AtsuStatusCodes> {
    if (SimVar.GetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number') !== 1) {
      AcarsConnector.flightNumber = flightNo;
      return AtsuStatusCodes.NoAcarsConnection;
    }

    return AcarsConnector.isCallsignInUse(flightNo).then((code) => {
      if (code === AtsuStatusCodes.Ok) {
        AcarsConnector.flightNumber = flightNo;
        return AcarsConnector.poll().then(() => code);
      }
      return code;
    });
  }

  public static disconnect(): AtsuStatusCodes {
    AcarsConnector.flightNumber = '';
    return AtsuStatusCodes.Ok;
  }

  public static async isCallsignInUse(station: string): Promise<AtsuStatusCodes> {
    if (SimVar.GetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number') !== 1) {
      return AtsuStatusCodes.NoAcarsConnection;
    }

    const acarsNetwork = NXDataStore.get('CONFIG_ACARS_NETWORK', AcarsNetwork.Disabled);
    if (!acarsNetwork || acarsNetwork === AcarsNetwork.Disabled) {
      console.log('No ACARS Network set');
      return;
    }

    const identifier = AcarsConnector.getIdentifierByNetwork(acarsNetwork);
    if (!identifier) {
      console.log('No ACARS-ID set');
      return;
    }

    const body = {
      logon: identifier,
      from: station,
      to: 'SERVER',
      type: 'ping',
      packet: station,
    };

    let text: string = '';
    switch (acarsNetwork) {
      case AcarsNetwork.Hoppie:
        text = await Hoppie.sendRequest(body).then((resp) => resp.response);
        break;
      case AcarsNetwork.SayIntentions:
        text = await SayIntentions.sendRequest(body).then((resp) => resp.response);
        break;
    }

    if (text === 'error {callsign already in use}') {
      return AtsuStatusCodes.CallsignInUse;
    }
    if (text.includes('error')) {
      return AtsuStatusCodes.ProxyError;
    }
    if (text.startsWith('ok') !== true) {
      return AtsuStatusCodes.ComFailed;
    }

    return AtsuStatusCodes.Ok;
  }

  public static async isStationAvailable(station: string): Promise<AtsuStatusCodes> {
    if (SimVar.GetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number') !== 1 || AcarsConnector.flightNumber === '') {
      return AtsuStatusCodes.NoAcarsConnection;
    }

    if (station === AcarsConnector.flightNumber) {
      return AtsuStatusCodes.OwnCallsign;
    }

    const acarsNetwork = NXDataStore.get('CONFIG_ACARS_NETWORK', AcarsNetwork.Disabled);
    if (!acarsNetwork || acarsNetwork === AcarsNetwork.Disabled) {
      console.log('No ACARS Network set');
      return;
    }

    const identifier = AcarsConnector.getIdentifierByNetwork(acarsNetwork);
    if (!identifier) {
      console.log('No ACARS-ID set');
      return;
    }

    const body = {
      logon: identifier,
      from: AcarsConnector.flightNumber,
      to: 'SERVER',
      type: 'ping',
      packet: station,
    };

    let text: string = '';
    switch (acarsNetwork) {
      case AcarsNetwork.Hoppie:
        text = await Hoppie.sendRequest(body).then((resp) => resp.response);
        break;
      case AcarsNetwork.SayIntentions:
        text = await SayIntentions.sendRequest(body).then((resp) => resp.response);
        break;
    }

    if (text.includes('error')) {
      return AtsuStatusCodes.ProxyError;
    }
    if (text.startsWith('ok') !== true) {
      return AtsuStatusCodes.ComFailed;
    }
    if (text !== `ok {${station}}`) {
      return AtsuStatusCodes.NoAtc;
    }

    return AtsuStatusCodes.Ok;
  }

  private static async sendMessage(message: AtsuMessage, type: string): Promise<AtsuStatusCodes> {
    if (SimVar.GetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number') !== 1 || AcarsConnector.flightNumber === '') {
      return AtsuStatusCodes.NoAcarsConnection;
    }

    const acarsNetwork = NXDataStore.get('CONFIG_ACARS_NETWORK', AcarsNetwork.Disabled);
    if (!acarsNetwork || acarsNetwork === AcarsNetwork.Disabled) {
      console.log('No ACARS Network set');
      return;
    }

    const identifier = AcarsConnector.getIdentifierByNetwork(acarsNetwork);
    if (!identifier) {
      console.log('No ACARS-ID set');
      return;
    }

    const body = {
      logon: identifier,
      from: AcarsConnector.flightNumber,
      to: message.Station,
      type,
      packet: message.serialize(AtsuMessageSerializationFormat.Network),
    };

    let text: string = '';
    switch (acarsNetwork) {
      case AcarsNetwork.Hoppie:
        text = await Hoppie.sendRequest(body)
          .then((resp) => resp.response)
          .catch(() => 'proxy');
        break;
      case AcarsNetwork.SayIntentions:
        text = await SayIntentions.sendRequest(body)
          .then((resp) => resp.response)
          .catch(() => 'proxy');
        break;
    }

    if (text === 'proxy') {
      return AtsuStatusCodes.ProxyError;
    }

    if (text !== 'ok') {
      return AtsuStatusCodes.ComFailed;
    }

    return AtsuStatusCodes.Ok;
  }

  public static async sendTelexMessage(message: AtsuMessage, force: boolean): Promise<AtsuStatusCodes> {
    if (
      AcarsConnector.flightNumber !== '' &&
      (force || SimVar.GetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number') === 1)
    ) {
      return AcarsConnector.sendMessage(message, 'telex');
    }
    return AtsuStatusCodes.NoAcarsConnection;
  }

  public static async sendCpdlcMessage(message: CpdlcMessage, force: boolean): Promise<AtsuStatusCodes> {
    if (
      AcarsConnector.flightNumber !== '' &&
      (force || SimVar.GetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number') === 1)
    ) {
      return AcarsConnector.sendMessage(message, 'cpdlc');
    }
    return AtsuStatusCodes.NoAcarsConnection;
  }

  private static levenshteinDistance(template: string, message: string, content: CpdlcMessageContent[]): number {
    let elements = message.replace(/\n/g, ' ').split(' ');
    let validContent = true;

    // try to match the content
    content.forEach((entry) => {
      const result = entry.validateAndReplaceContent(elements);
      if (!result.matched) {
        validContent = false;
      } else {
        elements = result.remaining;
      }
    });
    if (!validContent) return 100000;
    const correctedMessage = elements.join(' ');

    // initialize the track matrix
    const track = Array(correctedMessage.length + 1)
      .fill(null)
      .map(() => Array(template.length + 1).fill(null));
    for (let i = 0; i <= template.length; ++i) track[0][i] = i;
    for (let i = 0; i <= correctedMessage.length; ++i) track[i][0] = i;

    for (let j = 1; j <= correctedMessage.length; ++j) {
      for (let i = 1; i <= template.length; ++i) {
        const indicator = template[i - 1] === correctedMessage[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // delete
          track[j - 1][i] + 1, // insert
          track[j - 1][i - 1] + indicator, // substitude
        );
      }
    }

    return track[correctedMessage.length][template.length];
  }

  private static cpdlcMessageClassification(message: string): CpdlcMessageElement | undefined {
    const scores: [number, string][] = [];
    let minScore = 100000;

    // clear the message from marker, etc.
    const clearedMessage = message.replace(/@/gi, '').replace(/_/gi, ' ');

    // test all uplink messages
    for (const ident in CpdlcMessagesUplink) {
      if ({}.hasOwnProperty.call(CpdlcMessagesUplink, ident)) {
        const data = CpdlcMessagesUplink[ident];

        if (AcarsConnector.fansMode === FansMode.FansNone || data[1].FansModes.includes(AcarsConnector.fansMode)) {
          let minDistance = 100000;

          data[0].forEach((template) => {
            const distance = AcarsConnector.levenshteinDistance(template, clearedMessage, data[1].Content);
            if (minDistance > distance) minDistance = distance;
          });

          scores.push([minDistance, ident]);
          if (minScore > minDistance) minScore = minDistance;
        }
      }
    }

    // get all entries with the minimal score
    let matches: string[] = [];
    scores.forEach((elem) => {
      if (elem[0] === minScore) matches.push(elem[1]);
    });

    if (matches.length === 0) return undefined;

    // check if message without parameters are in, but the minScore not empty
    if (matches.length > 1 && minScore !== 0) {
      const nonEmpty = matches.filter((match) => CpdlcMessagesUplink[match][1].Content.length !== 0);
      if (nonEmpty.length !== 0 && matches.length !== nonEmpty.length) {
        matches = nonEmpty;
      }
    }

    // check if more than the freetext-entry is valid
    if (matches.length > 1) {
      const nonFreetext = matches.filter((match) => match !== 'UM169' && match !== 'UM183');
      if (nonFreetext.length !== 0 && matches.length !== nonFreetext.length) {
        matches = nonFreetext;
      }
    }

    // check if the FANS mode is invalid
    if (matches.length > 1 && this.fansMode !== FansMode.FansNone) {
      const validFans = matches.filter(
        (match) => CpdlcMessagesUplink[match][1].FansModes.findIndex((elem) => elem === this.fansMode) !== -1,
      );
      if (validFans.length !== 0 && matches.length !== validFans.length) {
        matches = validFans;
      }
    }

    // create a deep-copy of the message
    const retval: CpdlcMessageElement = CpdlcMessagesUplink[matches[0]][1].deepCopy();
    let elements: string[] = [];

    // keep the highlight flags for freetext messages
    if (retval.TypeId === 'UM169' || retval.TypeId === 'UM183') {
      elements = message.replace(/_/gi, ' ').split(' ');
    } else {
      elements = clearedMessage.split(' ');
    }

    // parse the content and store it in the deep copy
    retval.Content.forEach((entry) => {
      const result = entry.validateAndReplaceContent(elements);
      elements = result.remaining;
    });

    return retval;
  }

  public static async poll(): Promise<[AtsuStatusCodes, AtsuMessage[]]> {
    const retval: AtsuMessage[] = [];

    if (SimVar.GetSimVarValue('L:A32NX_ACARS_ACTIVE', 'number') !== 1 || AcarsConnector.flightNumber === '') {
      return [AtsuStatusCodes.NoAcarsConnection, retval];
    }

    const acarsNetwork = NXDataStore.get('CONFIG_ACARS_NETWORK', AcarsNetwork.Disabled);
    const identifier = AcarsConnector.getIdentifierByNetwork(acarsNetwork);

    try {
      const body = {
        logon: identifier,
        from: AcarsConnector.flightNumber,
        to: AcarsConnector.flightNumber,
        type: 'poll',
      };

      let text: string = '';
      switch (acarsNetwork) {
        case AcarsNetwork.Hoppie:
          text = await Hoppie.sendRequest(body)
            .then((resp) => resp.response)
            .catch(() => 'proxy');
          break;
        case AcarsNetwork.SayIntentions:
          text = await SayIntentions.sendRequest(body)
            .then((resp) => resp.response)
            .catch(() => 'proxy');
          break;
      }

      // proxy error during request
      if (text === 'proxy') {
        return [AtsuStatusCodes.ProxyError, retval];
      }

      // something went wrong
      if (!text.startsWith('ok')) {
        return [AtsuStatusCodes.ComFailed, retval];
      }

      // split up the received data into multiple messages
      let messages = text.split(/({[\s\S\n]*?})/gm);
      messages = messages.filter(
        (elem) => elem !== 'ok' && elem !== 'ok ' && elem !== '} ' && elem !== '}' && elem !== '',
      );

      // create the messages
      messages.forEach((element) => {
        // get the single entries of the message
        // example: [CALLSIGN telex, {Hello world!}]
        const entries = element.substring(1).split(/({[\s\S\n]*?})/gm);

        // get all relevant information
        const metadata = entries[0].split(' ');
        const sender = metadata[0].toUpperCase();
        const type = metadata[1].toLowerCase();
        const content = entries[1].replace(/{/, '').replace(/}/, '').toUpperCase();

        switch (type) {
          case 'telex': {
            const freetext = new FreetextMessage();
            freetext.Network = AtsuMessageNetwork.ACARS;
            freetext.Station = sender;
            freetext.Direction = AtsuMessageDirection.Uplink;
            freetext.ComStatus = AtsuMessageComStatus.Received;
            freetext.Message = content;
            retval.push(freetext);
            break;
          }
          case 'cpdlc': {
            const cpdlc = new CpdlcMessage();
            cpdlc.Station = sender;
            cpdlc.Direction = AtsuMessageDirection.Uplink;
            cpdlc.ComStatus = AtsuMessageComStatus.Received;

            // split up the data
            const elements = content.split('/');
            cpdlc.CurrentTransmissionId = parseInt(elements[2]);
            if (elements[3] !== '') {
              cpdlc.PreviousTransmissionId = parseInt(elements[3]);
            }
            cpdlc.Message = elements[5];
            cpdlc.Content.push(AcarsConnector.cpdlcMessageClassification(cpdlc.Message));
            if ((elements[4] as CpdlcMessageExpectedResponseType) !== cpdlc.Content[0]?.ExpectedResponse) {
              cpdlc.Content[0].ExpectedResponse = elements[4] as CpdlcMessageExpectedResponseType;
            }

            retval.push(cpdlc);
            break;
          }
          default:
            break;
        }
      });

      return [AtsuStatusCodes.Ok, retval];
    } catch (_err) {
      return [AtsuStatusCodes.NoAcarsConnection, []];
    }
  }

  /**
   * Gets the interval to poll the Hoppie API in milliseconds.
   * Warning: This will return a different random time on each invocation!
   * @returns The polling interval in milliseconds.
   */
  public static pollInterval(): number {
    // To comply with Hoppie rate limits, we choose a random number between 45 and 75, as recommend by Hoppie. Ref to: https://www.hoppie.nl/acars/system/tech.html
    return Math.random() * 30_000 + 45_000;
  }
}
