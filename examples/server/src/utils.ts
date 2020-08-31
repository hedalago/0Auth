
export function validatePhone(phone: string): boolean {
  // In this place, the developer can simply verify the string
  // or receive verification from a trusted authority.
  return phone.length > 8
}

export function validateAddress(address: string): boolean {
  // In this place, the developer can simply verify the string
  // or receive verification from a trusted authority.
  return address.length > 5
}

export function validateAge(age: string): boolean {
  // Assume a verification request from a trusted authority.
  //
  // Initially verified by a trusted authority, and when used later,
  // it is no longer verified by a trusted authority.
  return true;
}
