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
  
  // Aplica a máscara (99) 99999-9999
  if (numbers.length <= 2) {
    return numbers.length > 0 ? `(${numbers}` : numbers;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else {
    // Para números com 11 dígitos (celular com 9 dígitos)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.length === 11;
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

