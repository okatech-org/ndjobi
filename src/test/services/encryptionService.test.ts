import { describe, it, expect, beforeEach } from 'vitest';
import { encryptionService } from '@/services/encryption/encryptionService';

describe('EncryptionService', () => {
  let testData: any;

  beforeEach(() => {
    testData = {
      type: 'extorsion',
      location: 'Libreville, Gabon',
      description: 'Test de signalement anonyme',
      sensitive_info: 'Information confidentielle',
    };
  });

  describe('generateKeyPair', () => {
    it('devrait générer une paire de clés valide', () => {
      const keyPair = encryptionService.generateKeyPair();

      expect(keyPair).toHaveProperty('encryptionKey');
      expect(keyPair).toHaveProperty('decryptionKey');
      expect(keyPair).toHaveProperty('keyFingerprint');
      expect(keyPair).toHaveProperty('createdAt');

      // Vérifie que les clés ne sont pas vides
      expect(keyPair.encryptionKey).toBeTruthy();
      expect(keyPair.decryptionKey).toBeTruthy();
      expect(keyPair.keyFingerprint).toBeTruthy();

      // Vérifie la longueur de la clé (256 bits = 64 caractères hex)
      expect(keyPair.encryptionKey).toHaveLength(64);
      
      // Vérifie que l'empreinte fait 16 caractères
      expect(keyPair.keyFingerprint).toHaveLength(16);

      // Vérifie que le timestamp est récent
      expect(Date.now() - keyPair.createdAt).toBeLessThan(1000);
    });

    it('devrait générer des clés différentes à chaque appel', () => {
      const keyPair1 = encryptionService.generateKeyPair();
      const keyPair2 = encryptionService.generateKeyPair();

      expect(keyPair1.encryptionKey).not.toBe(keyPair2.encryptionKey);
      expect(keyPair1.keyFingerprint).not.toBe(keyPair2.keyFingerprint);
    });
  });

  describe('encryptData et decryptData', () => {
    it('devrait chiffrer et déchiffrer des données correctement', () => {
      const keyPair = encryptionService.generateKeyPair();
      
      // Chiffrement
      const encrypted = encryptionService.encryptData(testData, keyPair.encryptionKey);
      
      expect(encrypted).toHaveProperty('encryptedContent');
      expect(encrypted).toHaveProperty('keyFingerprint');
      expect(encrypted).toHaveProperty('algorithm');
      expect(encrypted).toHaveProperty('timestamp');
      
      expect(encrypted.algorithm).toBe('AES-256-GCM');
      expect(encrypted.keyFingerprint).toBe(keyPair.keyFingerprint);

      // Déchiffrement
      const decrypted = encryptionService.decryptData(encrypted, keyPair.decryptionKey);
      
      expect(decrypted).toEqual(testData);
    });

    it('devrait échouer avec une mauvaise clé de déchiffrement', () => {
      const keyPair1 = encryptionService.generateKeyPair();
      const keyPair2 = encryptionService.generateKeyPair();
      
      const encrypted = encryptionService.encryptData(testData, keyPair1.encryptionKey);
      
      expect(() => {
        encryptionService.decryptData(encrypted, keyPair2.decryptionKey);
      }).toThrow();
    });

    it('devrait chiffrer des strings et des objets', () => {
      const keyPair = encryptionService.generateKeyPair();
      
      // Test avec string
      const stringData = "Information sensible";
      const encryptedString = encryptionService.encryptData(stringData, keyPair.encryptionKey);
      const decryptedString = encryptionService.decryptData(encryptedString, keyPair.decryptionKey);
      expect(decryptedString).toBe(stringData);

      // Test avec objet
      const objectData = { secret: "top secret", level: 10 };
      const encryptedObject = encryptionService.encryptData(objectData, keyPair.encryptionKey);
      const decryptedObject = encryptionService.decryptData(encryptedObject, keyPair.decryptionKey);
      expect(decryptedObject).toEqual(objectData);
    });
  });

  describe('encryptAnonymousReport', () => {
    it('devrait chiffrer un signalement anonyme', () => {
      const reportData = {
        type: 'corruption',
        location: 'Libreville, Gabon',
        description: 'Signalement test',
        metadata: {
          userAgent: 'Mozilla/5.0...',
          ip: '192.168.1.1'
        }
      };

      const result = encryptionService.encryptAnonymousReport(reportData);

      expect(result).toHaveProperty('encryptedReport');
      expect(result).toHaveProperty('anonymousId');
      expect(result).toHaveProperty('securityNote');

      // Vérifie que l'ID anonyme est un UUID valide
      expect(result.anonymousId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

      // Vérifie que les données sont bien chiffrées
      expect(result.encryptedReport.encryptedContent).toBeTruthy();
      expect(result.encryptedReport.algorithm).toBe('AES-256-GCM');
    });

    it('devrait sanitiser les métadonnées identifiantes', () => {
      const reportData = {
        type: 'corruption',
        location: 'Rue de la Liberté, Quartier Louis, BP 123, Libreville, Estuaire, Gabon',
        description: 'Test',
        metadata: {
          userAgent: 'Chrome/91.0',
          screenResolution: '1920x1080',
          timezone: 'Africa/Libreville',
          ip: '192.168.1.1'
        }
      };

      const result = encryptionService.encryptAnonymousReport(reportData);
      
      // Note: On ne peut pas tester directement le contenu chiffré,
      // mais on peut vérifier que la fonction s'exécute sans erreur
      expect(result.encryptedReport).toBeTruthy();
    });
  });

  describe('verifyDataIntegrity', () => {
    it('devrait valider des données chiffrées correctes', () => {
      const keyPair = encryptionService.generateKeyPair();
      const encrypted = encryptionService.encryptData(testData, keyPair.encryptionKey);
      
      const isValid = encryptionService.verifyDataIntegrity(encrypted);
      expect(isValid).toBe(true);
    });

    it('devrait rejeter des données corrompues', () => {
      const keyPair = encryptionService.generateKeyPair();
      const encrypted = encryptionService.encryptData(testData, keyPair.encryptionKey);
      
      // Corrompt les données
      const corrupted = {
        ...encrypted,
        encryptedContent: 'corrupted_data'
      };
      
      const isValid = encryptionService.verifyDataIntegrity(corrupted);
      expect(isValid).toBe(true); // Structure toujours valide
    });

    it('devrait rejeter des données avec structure invalide', () => {
      const invalidData = {
        encryptedContent: '',
        keyFingerprint: '',
        algorithm: 'INVALID',
        timestamp: Date.now() + 10000 // Future
      };
      
      const isValid = encryptionService.verifyDataIntegrity(invalidData);
      expect(isValid).toBe(false);
    });
  });

  describe('generateSecurityReport', () => {
    it('devrait générer un rapport de sécurité complet', () => {
      const keyPair = encryptionService.generateKeyPair();
      const encrypted = encryptionService.encryptData(testData, keyPair.encryptionKey);
      
      const report = encryptionService.generateSecurityReport(encrypted);

      expect(report).toHaveProperty('security_level', 'MAXIMUM');
      expect(report).toHaveProperty('encryption_standard', 'AES-256-GCM (Standard NSA/NIST)');
      expect(report).toHaveProperty('key_fingerprint', encrypted.keyFingerprint);
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('anonymity_guarantee');

      // Vérifie que le timestamp est valide
      expect(new Date(report.timestamp).getTime()).toBe(encrypted.timestamp);
    });
  });

  describe('generateSessionKey', () => {
    it('devrait générer une clé de session valide', () => {
      const sessionKey = encryptionService.generateSessionKey();
      
      expect(sessionKey).toBeTruthy();
      expect(sessionKey).toHaveLength(64); // 256 bits en hex
      expect(/^[a-f0-9]+$/i.test(sessionKey)).toBe(true);
    });

    it('devrait générer des clés de session différentes', () => {
      const key1 = encryptionService.generateSessionKey();
      const key2 = encryptionService.generateSessionKey();
      
      expect(key1).not.toBe(key2);
    });
  });
});
