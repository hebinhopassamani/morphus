export class MorphusGuid {
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
    return guid instanceof MorphusGuid || MorphusGuid.validator.test(value);
  }

  public static create(): MorphusGuid {
    return new MorphusGuid(
      [
        MorphusGuid.gen(2),
        MorphusGuid.gen(1),
        MorphusGuid.gen(1),
        MorphusGuid.gen(1),
        MorphusGuid.gen(3),
      ].join('-'),
    );
  }

  public static createAsString(): string {
    return MorphusGuid.create().toString();
  }

  public static createEmpty(): MorphusGuid {
    return new MorphusGuid(MorphusGuid.EMPTY);
  }

  public static parse(guid: string): MorphusGuid {
    return new MorphusGuid(guid);
  }

  public static raw(): string {
    return [
      MorphusGuid.gen(2),
      MorphusGuid.gen(1),
      MorphusGuid.gen(1),
      MorphusGuid.gen(1),
      MorphusGuid.gen(3),
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

    this.value = MorphusGuid.EMPTY;

    if (guid && MorphusGuid.isGuid(guid)) {
      this.value = guid;
    }
  }

  public equals(other: MorphusGuid): boolean {
    return MorphusGuid.isGuid(other) && this.value === other.toString();
  }

  public isEmpty(): boolean {
    return this.value === MorphusGuid.EMPTY;
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
