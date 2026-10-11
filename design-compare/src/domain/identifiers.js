const identifier = /^[a-z][a-z0-9-]{0,63}$/;

export const isIdentifier = value => typeof value === 'string' && identifier.test(value);

export function validateId(id) {
  if (!isIdentifier(id)) throw new Error('Reference ID: 소문자로 시작하는 영문·숫자·하이픈, 최대 64자');
  return id;
}
