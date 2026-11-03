export class MorphusUtil {
  public static specialChars = [
    { val: 'a', let: 'áàãâä' },
    { val: 'e', let: 'éèêë' },
    { val: 'i', let: 'íìîï' },
    { val: 'o', let: 'óòõôö' },
    { val: 'u', let: 'úùûü' },
    { val: 'c', let: 'ç' },
    { val: 'A', let: 'ÁÀÃÂÄ' },
    { val: 'E', let: 'ÉÈÊË' },
    { val: 'I', let: 'ÍÌÎÏ' },
    { val: 'O', let: 'ÓÒÕÔÖ' },
    { val: 'U', let: 'ÚÙÛÜ' },
    { val: 'C', let: 'Ç' },
    { val: '', let: ' ' },
  ];

  public static removeSpeciaisCharacters(str: string): string {
    const spaceSymbol = '-';
    let returnString = str;
    for (let i = 0; i < MorphusUtil.specialChars.length; i++) {
      const regex = new RegExp('[' + MorphusUtil.specialChars[i].let + ']', 'g');
      returnString = returnString.replace(regex, MorphusUtil.specialChars[i].val);
    }
    return returnString.replace(/\s/g, spaceSymbol);
  }

  public static isNotNull(obj: unknown): boolean {
    return obj !== undefined && obj !== null;
  }

  public static toSeconds(milliseconds?: number): number {
    if (milliseconds) {
      const dif = milliseconds * 1000 - new Date().getTime();
      return Math.round(dif / 1000);
    }
    return 0;
  }

  public static toTime(seconds: number): { minutos: number; segundos: number } {
    const minutos = Math.floor(seconds / 60);
    const segundos = seconds % 60;
    return { minutos, segundos };
  }

  public static calculateDateDifferenceInSeconds(date1: Date, date2: Date): number {
    const differenceInMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(differenceInMs / 1000);
  }

  public static isNumber(str: string): boolean {
    const numericRegex = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
    return numericRegex.test(str);
  }

  public static isDecimal(num: number): boolean {
    return MorphusUtil.isNumber(num.toString()) && !Number.isInteger(Number(num));
  }

  public static isEmail(value: string): boolean {
    /* prettier-ignore */
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value,
    );
  }

  public static isCpf(cpfValue: unknown): boolean {
    try {
      const cpf = String(cpfValue ?? '').replace(/\D+/g, '');
      if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
      }

      let soma = 0;
      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
      }

      let resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) {
        resto = 0;
      }
      if (resto !== parseInt(cpf.substring(9, 10), 10)) {
        return false;
      }

      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
      }

      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) {
        resto = 0;
      }

      return resto === parseInt(cpf.substring(10, 11), 10);
    } catch {
      return false;
    }
  }

  public static isCnpj(cnpjValue: unknown): boolean {
    try {
      const cnpj = String(cnpjValue ?? '').replace(/\D+/g, '');
      if (!cnpj || cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
      }

      let tamanho = cnpj.length - 2;
      let numeros = cnpj.substring(0, tamanho);
      const digitos = cnpj.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;

      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
        if (pos < 2) {
          pos = 9;
        }
      }

      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(0), 10)) {
        return false;
      }

      tamanho += 1;
      numeros = cnpj.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;

      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
        if (pos < 2) {
          pos = 9;
        }
      }

      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      return resultado === parseInt(digitos.charAt(1), 10);
    } catch {
      return false;
    }
  }
}
