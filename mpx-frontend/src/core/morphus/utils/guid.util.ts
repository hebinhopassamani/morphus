export class MpxGuid {
  public static validator = new RegExp(
    '^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$',
    'i',
  );

  public static EMPTY = '00000000-0000-0000-0000-000000000000';

  public static isGuid(guid: unknown): boolean {
    if (!guid) {
      return false;
    }
    const value = String(guid);
    return guid instanceof MpxGuid || MpxGuid.validator.test(value);
  }

  public static create(): MpxGuid {
    return new MpxGuid(
      [
        MpxGuid.gen(2),
        MpxGuid.gen(1),
        MpxGuid.gen(1),
        MpxGuid.gen(1),
        MpxGuid.gen(3),
      ].join('-'),
    );
  }

  public static createAsString(): string {
    return MpxGuid.create().toString();
  }

  public static createEmpty(): MpxGuid {
    return new MpxGuid(MpxGuid.EMPTY);
  }

  public static parse(guid: string): MpxGuid {
    return new MpxGuid(guid);
  }

  public static raw(): string {
    return [
      MpxGuid.gen(2),
      MpxGuid.gen(1),
      MpxGuid.gen(1),
      MpxGuid.gen(1),
      MpxGuid.gen(3),
    ].join('-');
  }

  private static gen(count: number): string {
    let out = '';
    for (let i = 0; i < count; i++) {
      out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return out;
  }

  private value: string;

  private constructor(guid: string) {
    if (!guid) {
      throw new TypeError('Invalid argument; `value` has no value.');
    }

    this.value = MpxGuid.EMPTY;

    if (guid && MpxGuid.isGuid(guid)) {
      this.value = guid;
    }
  }

  public equals(other: MpxGuid): boolean {
    return MpxGuid.isGuid(other) && this.value === other.toString();
  }

  public isEmpty(): boolean {
    return this.value === MpxGuid.EMPTY;
  }

  public toString(): string {
    return this.value;
  }

  public toJSON(): { value: string } {
    return {
      value: this.value,
    };
  }
}
