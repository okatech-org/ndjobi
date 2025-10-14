import { ethers, BrowserProvider, Contract, Signer } from 'ethers';
import { toast } from '@/hooks/use-toast';

// ABI du contrat NdjobiProtection (simplifié pour les fonctions essentielles)
const NDJOBI_PROTECTION_ABI = [
  "function protectProject(string memory title, string memory description, string memory category, bytes32 projectHash, string memory metadataURI) external returns (uint256)",
  "function verifyProject(bytes32 projectHash) external view returns (bool exists, uint256 tokenId, address owner, uint256 timestamp)",
  "function getProjectDetails(uint256 tokenId) external view returns (tuple(string title, string description, string category, bytes32 projectHash, address owner, uint256 timestamp, bool isActive, string metadataURI))",
  "function getUserProjects(address user) external view returns (uint256[] memory)",
  "function getTotalProtectedProjects() external view returns (uint256)",
  "event ProjectProtected(uint256 indexed tokenId, address indexed owner, bytes32 indexed projectHash, string title, uint256 timestamp)"
];

export interface ProtectedProject {
  tokenId: number;
  title: string;
  description: string;
  category: string;
  projectHash: string;
  owner: string;
  timestamp: number;
  isActive: boolean;
  metadataURI: string;
}

export interface BlockchainConfig {
  contractAddress: string;
  networkName: string;
  chainId: number;
  rpcUrl: string;
}

// Configuration par défaut (à adapter selon l'environnement)
const DEFAULT_CONFIG: BlockchainConfig = {
  contractAddress: process.env.VITE_NDJOBI_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  networkName: process.env.VITE_BLOCKCHAIN_NETWORK || "localhost",
  chainId: parseInt(process.env.VITE_BLOCKCHAIN_CHAIN_ID || "31337"),
  rpcUrl: process.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545"
};

class BlockchainService {
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private contract: Contract | null = null;
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Initialise la connexion à MetaMask/wallet
   */
  async initializeWallet(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        toast({
          variant: 'destructive',
          title: 'Wallet requis',
          description: 'Veuillez installer MetaMask pour protéger vos projets sur blockchain.',
        });
        return false;
      }

      // Demander l'accès au wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Vérifier le réseau
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== this.config.chainId) {
        await this.switchNetwork();
      }

      // Initialiser le contrat
      this.contract = new Contract(this.config.contractAddress, NDJOBI_PROTECTION_ABI, this.signer);

      toast({
        title: 'Wallet connecté',
        description: `Connecté au réseau ${this.config.networkName}`,
      });

      return true;
    } catch (error) {
      console.error('Erreur initialisation wallet:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au wallet blockchain.',
      });
      return false;
    }
  }

  /**
   * Change de réseau blockchain
   */
  private async switchNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.config.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Si le réseau n'existe pas, l'ajouter
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${this.config.chainId.toString(16)}`,
            chainName: this.config.networkName,
            rpcUrls: [this.config.rpcUrl],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Génère un hash unique pour un projet
   */
  generateProjectHash(title: string, description: string, userAddress: string): string {
    const dataToHash = `${title}|${description}|${userAddress}|${Date.now()}`;
    return ethers.id(dataToHash);
  }

  /**
   * Protège un projet sur la blockchain
   */
  async protectProject(
    title: string,
    description: string,
    category: string,
    metadataURI: string = ""
  ): Promise<{ success: boolean; tokenId?: number; txHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.signer) {
        const initialized = await this.initializeWallet();
        if (!initialized) {
          return { success: false, error: "Wallet non initialisé" };
        }
      }

      const userAddress = await this.signer!.getAddress();
      const projectHash = this.generateProjectHash(title, description, userAddress);

      // Vérifier si le projet existe déjà
      const existingProject = await this.verifyProject(projectHash);
      if (existingProject.exists) {
        return { success: false, error: "Ce projet est déjà protégé" };
      }

      toast({
        title: 'Protection en cours',
        description: 'Envoi de la transaction blockchain...',
      });

      // Envoyer la transaction
      const tx = await this.contract!.protectProject(
        title,
        description,
        category,
        projectHash,
        metadataURI
      );

      toast({
        title: 'Transaction confirmée',
        description: 'Attente de la confirmation blockchain...',
      });

      // Attendre la confirmation
      const receipt = await tx.wait();
      
      // Extraire le tokenId des logs
      const event = receipt.logs.find((log: any) => {
        try {
          return this.contract!.interface.parseLog(log)?.name === 'ProjectProtected';
        } catch {
          return false;
        }
      });

      let tokenId = 0;
      if (event) {
        const parsedEvent = this.contract!.interface.parseLog(event);
        tokenId = Number(parsedEvent?.args[0] || 0);
      }

      toast({
        title: '🎉 Projet protégé !',
        description: `Votre projet est maintenant protégé sur blockchain (Token #${tokenId})`,
      });

      return {
        success: true,
        tokenId,
        txHash: receipt.hash
      };

    } catch (error: any) {
      console.error('Erreur protection blockchain:', error);
      
      let errorMessage = "Erreur blockchain inconnue";
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = "Transaction annulée par l'utilisateur";
      } else if (error.message?.includes('already protected')) {
        errorMessage = "Ce projet est déjà protégé";
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = "Fonds insuffisants pour la transaction";
      }

      toast({
        variant: 'destructive',
        title: 'Erreur de protection',
        description: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Vérifie si un projet est protégé sur la blockchain
   */
  async verifyProject(projectHash: string): Promise<{
    exists: boolean;
    tokenId?: number;
    owner?: string;
    timestamp?: number;
  }> {
    try {
      if (!this.contract) {
        // Utiliser un provider read-only si pas de wallet connecté
        const readOnlyProvider = new ethers.JsonRpcProvider(this.config.rpcUrl);
        const readOnlyContract = new Contract(this.config.contractAddress, NDJOBI_PROTECTION_ABI, readOnlyProvider);
        
        const result = await readOnlyContract.verifyProject(projectHash);
        return {
          exists: result[0],
          tokenId: result[0] ? Number(result[1]) : undefined,
          owner: result[0] ? result[2] : undefined,
          timestamp: result[0] ? Number(result[3]) : undefined,
        };
      }

      const result = await this.contract.verifyProject(projectHash);
      return {
        exists: result[0],
        tokenId: result[0] ? Number(result[1]) : undefined,
        owner: result[0] ? result[2] : undefined,
        timestamp: result[0] ? Number(result[3]) : undefined,
      };
    } catch (error) {
      console.error('Erreur vérification projet:', error);
      return { exists: false };
    }
  }

  /**
   * Obtient tous les projets d'un utilisateur
   */
  async getUserProjects(userAddress: string): Promise<ProtectedProject[]> {
    try {
      if (!this.contract) {
        const readOnlyProvider = new ethers.JsonRpcProvider(this.config.rpcUrl);
        const readOnlyContract = new Contract(this.config.contractAddress, NDJOBI_PROTECTION_ABI, readOnlyProvider);
        
        const tokenIds = await readOnlyContract.getUserProjects(userAddress);
        return this.getProjectsDetails(tokenIds, readOnlyContract);
      }

      const tokenIds = await this.contract.getUserProjects(userAddress);
      return this.getProjectsDetails(tokenIds, this.contract);
    } catch (error) {
      console.error('Erreur récupération projets utilisateur:', error);
      return [];
    }
  }

  /**
   * Obtient les détails de plusieurs projets
   */
  private async getProjectsDetails(tokenIds: number[], contract: Contract): Promise<ProtectedProject[]> {
    const projects: ProtectedProject[] = [];
    
    for (const tokenId of tokenIds) {
      try {
        const details = await contract.getProjectDetails(tokenId);
        projects.push({
          tokenId: Number(tokenId),
          title: details.title,
          description: details.description,
          category: details.category,
          projectHash: details.projectHash,
          owner: details.owner,
          timestamp: Number(details.timestamp),
          isActive: details.isActive,
          metadataURI: details.metadataURI
        });
      } catch (error) {
        console.error(`Erreur récupération projet ${tokenId}:`, error);
      }
    }

    return projects;
  }

  /**
   * Obtient les statistiques globales
   */
  async getGlobalStats(): Promise<{ totalProjects: number }> {
    try {
      const readOnlyProvider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      const readOnlyContract = new Contract(this.config.contractAddress, NDJOBI_PROTECTION_ABI, readOnlyProvider);
      
      const total = await readOnlyContract.getTotalProtectedProjects();
      return { totalProjects: Number(total) };
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      return { totalProjects: 0 };
    }
  }

  /**
   * Génère un certificat de protection
   */
  generateCertificate(project: ProtectedProject): string {
    const certificateData = {
      tokenId: project.tokenId,
      title: project.title,
      owner: project.owner,
      timestamp: project.timestamp,
      projectHash: project.projectHash,
      contractAddress: this.config.contractAddress,
      network: this.config.networkName
    };

    return `data:application/json;base64,${btoa(JSON.stringify(certificateData, null, 2))}`;
  }

  /**
   * Vérifie si le wallet est connecté
   */
  isWalletConnected(): boolean {
    return this.signer !== null && this.contract !== null;
  }

  /**
   * Obtient l'adresse du wallet connecté
   */
  async getWalletAddress(): Promise<string | null> {
    try {
      return this.signer ? await this.signer.getAddress() : null;
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();

// Types pour window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
