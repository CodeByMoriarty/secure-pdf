import { secureRandom } from '../utils/crypto.js';

export function applyEncryption(docOptions, password, permissionFlags) {
  const ownerPassword = secureRandom(32);

  docOptions.userPassword = password;
  docOptions.ownerPassword = ownerPassword;
  docOptions.pdfVersion = 1.7;

  if (permissionFlags && Object.keys(permissionFlags).length > 0) {
    docOptions.permissions = { ...permissionFlags };
  }

  return docOptions;
}
