// Utility functions for masks and validations

export function maskCPF(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara 999.999.999-99
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
}

export function maskPhone(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara (99) 99999-9999 para celular ou (99) 9999-9999 para fixo
  if (numbers.length <= 2) {
    return numbers.length > 0 ? `(${numbers}` : numbers;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length === 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  } else if (numbers.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  } else {
    // Para números incompletos, aplicar máscara progressiva
    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      // Assumir formato de celular se tiver mais de 7 dígitos
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCPF(cpf: string): boolean {
  // Remove tudo que não é dígito
  const numbers = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
  // Ex: 111.111.111-11, 222.222.222-22, etc.
  if (/^(\d)\1{10}$/.test(numbers)) {
    return false;
  }
  
  // Extrai os dígitos
  const digits = numbers.split('').map(Number);
  
  // Validação do primeiro dígito verificador
  // Multiplica os 9 primeiros dígitos pela sequência decrescente de 10 a 2
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  
  // Multiplica por 10 e pega o resto da divisão por 11
  let remainder = (sum * 10) % 11;
  
  // Se o resto for 10, consideramos como 0
  if (remainder === 10) {
    remainder = 0;
  }
  
  // Verifica se o primeiro dígito verificador está correto
  if (remainder !== digits[9]) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  // Multiplica os 10 primeiros dígitos (9 primeiros + primeiro verificador) pela sequência decrescente de 11 a 2
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  
  // Multiplica por 10 e pega o resto da divisão por 11
  remainder = (sum * 10) % 11;
  
  // Se o resto for 10, consideramos como 0
  if (remainder === 10) {
    remainder = 0;
  }
  
  // Verifica se o segundo dígito verificador está correto
  if (remainder !== digits[10]) {
    return false;
  }
  
  // Se passou em todas as validações, o CPF é válido
  return true;
}

export function validatePhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
}

export function validateFullName(name: string): { valid: boolean; hasMultipleNames: boolean } {
  const trimmedName = name.trim();
  const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
  
  return {
    valid: nameParts.length >= 2, // Pelo menos nome e sobrenome
    hasMultipleNames: nameParts.length >= 2,
  };
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um número' };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um caractere especial' };
  }
  
  return { valid: true };
}

