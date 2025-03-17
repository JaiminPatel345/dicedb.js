// package: wire
// file: cmd.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

export class Command extends jspb.Message {
  getCmd(): string;
  setCmd(value: string): void;

  clearArgsList(): void;
  getArgsList(): Array<string>;
  setArgsList(value: Array<string>): void;
  addArgs(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Command.AsObject;
  static toObject(includeInstance: boolean, msg: Command): Command.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Command, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Command;
  static deserializeBinaryFromReader(message: Command, reader: jspb.BinaryReader): Command;
}

export namespace Command {
  export type AsObject = {
    cmd: string,
    argsList: Array<string>,
  }
}

export class Response extends jspb.Message {
  getErr(): string;
  setErr(value: string): void;

  hasVNil(): boolean;
  clearVNil(): void;
  getVNil(): boolean;
  setVNil(value: boolean): void;

  hasVInt(): boolean;
  clearVInt(): void;
  getVInt(): number;
  setVInt(value: number): void;

  hasVStr(): boolean;
  clearVStr(): void;
  getVStr(): string;
  setVStr(value: string): void;

  hasVFloat(): boolean;
  clearVFloat(): void;
  getVFloat(): number;
  setVFloat(value: number): void;

  hasVBytes(): boolean;
  clearVBytes(): void;
  getVBytes(): Uint8Array | string;
  getVBytes_asU8(): Uint8Array;
  getVBytes_asB64(): string;
  setVBytes(value: Uint8Array | string): void;

  hasAttrs(): boolean;
  clearAttrs(): void;
  getAttrs(): google_protobuf_struct_pb.Struct | undefined;
  setAttrs(value?: google_protobuf_struct_pb.Struct): void;

  clearVListList(): void;
  getVListList(): Array<google_protobuf_struct_pb.Value>;
  setVListList(value: Array<google_protobuf_struct_pb.Value>): void;
  addVList(value?: google_protobuf_struct_pb.Value, index?: number): google_protobuf_struct_pb.Value;

  getValueCase(): Response.ValueCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Response.AsObject;
  static toObject(includeInstance: boolean, msg: Response): Response.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Response, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Response;
  static deserializeBinaryFromReader(message: Response, reader: jspb.BinaryReader): Response;
}

export namespace Response {
  export type AsObject = {
    err: string,
    vNil: boolean,
    vInt: number,
    vStr: string,
    vFloat: number,
    vBytes: Uint8Array | string,
    attrs?: google_protobuf_struct_pb.Struct.AsObject,
    vListList: Array<google_protobuf_struct_pb.Value.AsObject>,
  }

  export enum ValueCase {
    VALUE_NOT_SET = 0,
    V_NIL = 2,
    V_INT = 3,
    V_STR = 4,
    V_FLOAT = 5,
    V_BYTES = 6,
  }
}

