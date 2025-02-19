//  Copyright (c) 2022 FlyByWire Simulations
//  SPDX-License-Identifier: GPL-3.0

export enum AtsuStatusCodes {
  Ok,
  CallsignInUse,
  OwnCallsign,
  NoAcarsConnection,
  NoTelexConnection,
  TelexDisabled,
  ComFailed,
  NoAtc,
  MailboxFull,
  UnknownMessage,
  ProxyError,
  NewAtisReceived,
  NoAtisReceived,
  SystemBusy,
  EntryOutOfRange,
  FormatError,
  NotInDatabase,
}
