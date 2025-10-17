// Stub temporaire pour encryptionService - nécessite crypto-js correctement configuré
import CryptoJS from 'crypto-js';

class EncryptionService {
  private masterKey = 'ndjobi-master-key-2024';

  encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.masterKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.masterKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  }

  encryptObject(obj: Record<string, any>): string {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptObject<T>(encryptedData: string): T | null {
    try {
      const decrypted = this.decrypt(encryptedData);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Object decryption error:', error);
      return null;
    }
  }

  hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  generateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  encryptFile(fileData: ArrayBuffer): Promise<string> {
    return Promise.resolve(btoa(String.fromCharCode(...new Uint8Array(fileData))));
  }

  decryptFile(encryptedData: string): Promise<ArrayBuffer> {
    const binary = atob(encryptedData);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return Promise.resolve(buffer);
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;
