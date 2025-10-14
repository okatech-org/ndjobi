// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NdjobiProtection
 * @dev Smart contract pour la protection des projets innovants avec horodatage infalsifiable
 */
contract NdjobiProtection is ERC721, Ownable {
    using Counters for Counters.Counter;

    struct ProtectedProject {
        string title;
        string description;
        string category;
        bytes32 projectHash;
        address owner;
        uint256 timestamp;
        bool isActive;
        string metadataURI;
    }

    Counters.Counter private _tokenIdCounter;
    
    // Mapping du tokenId vers les détails du projet
    mapping(uint256 => ProtectedProject) private _protectedProjects;
    
    // Mapping du hash du projet vers le tokenId pour éviter les doublons
    mapping(bytes32 => uint256) private _projectHashToTokenId;
    
    // Mapping de l'adresse utilisateur vers ses projets
    mapping(address => uint256[]) private _userProjects;

    event ProjectProtected(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 indexed projectHash,
        string title,
        uint256 timestamp
    );

    event ProjectVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 timestamp
    );

    constructor() ERC721("Ndjobi Protection Certificate", "NPC") {}

    /**
     * @dev Protège un projet en créant un NFT de certification
     * @param title Titre du projet
     * @param description Description du projet
     * @param category Catégorie du projet
     * @param projectHash Hash unique du projet (généré côté client)
     * @param metadataURI URI vers les métadonnées IPFS
     * @return tokenId ID du token NFT créé
     */
    function protectProject(
        string memory title,
        string memory description,
        string memory category,
        bytes32 projectHash,
        string memory metadataURI
    ) external returns (uint256) {
        // Vérifier que le projet n'existe pas déjà
        require(_projectHashToTokenId[projectHash] == 0, "Projet deja protege");
        require(bytes(title).length > 0, "Titre requis");
        require(projectHash != bytes32(0), "Hash projet requis");

        // Incrémenter le compteur et obtenir le nouveau tokenId
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Créer la structure du projet protégé
        _protectedProjects[tokenId] = ProtectedProject({
            title: title,
            description: description,
            category: category,
            projectHash: projectHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            isActive: true,
            metadataURI: metadataURI
        });

        // Mapper le hash au tokenId
        _projectHashToTokenId[projectHash] = tokenId;
        
        // Ajouter à la liste des projets de l'utilisateur
        _userProjects[msg.sender].push(tokenId);

        // Minter le NFT
        _safeMint(msg.sender, tokenId);

        emit ProjectProtected(tokenId, msg.sender, projectHash, title, block.timestamp);

        return tokenId;
    }

    /**
     * @dev Vérifie l'existence et la validité d'un projet protégé
     * @param projectHash Hash du projet à vérifier
     * @return exists Si le projet existe
     * @return tokenId ID du token
     * @return owner Propriétaire du projet
     * @return timestamp Horodatage de protection
     */
    function verifyProject(bytes32 projectHash) 
        external 
        view 
        returns (bool exists, uint256 tokenId, address owner, uint256 timestamp) 
    {
        tokenId = _projectHashToTokenId[projectHash];
        exists = tokenId != 0;
        
        if (exists) {
            ProtectedProject memory project = _protectedProjects[tokenId];
            owner = project.owner;
            timestamp = project.timestamp;
        }
    }

    /**
     * @dev Obtient les détails complets d'un projet protégé
     * @param tokenId ID du token
     * @return project Détails du projet
     */
    function getProjectDetails(uint256 tokenId) 
        external 
        view 
        returns (ProtectedProject memory project) 
    {
        require(_exists(tokenId), "Token inexistant");
        return _protectedProjects[tokenId];
    }

    /**
     * @dev Obtient tous les projets d'un utilisateur
     * @param user Adresse de l'utilisateur
     * @return tokenIds Liste des IDs de tokens
     */
    function getUserProjects(address user) 
        external 
        view 
        returns (uint256[] memory tokenIds) 
    {
        return _userProjects[user];
    }

    /**
     * @dev Génère un certificat de protection (appelé par un vérificateur)
     * @param tokenId ID du token à certifier
     */
    function verifyCertificate(uint256 tokenId) external {
        require(_exists(tokenId), "Token inexistant");
        
        emit ProjectVerified(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @dev Obtient le nombre total de projets protégés
     * @return count Nombre total
     */
    function getTotalProtectedProjects() external view returns (uint256 count) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override pour empêcher les transferts (sauf mint initial)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        // Autoriser uniquement le mint initial (from = address(0))
        require(from == address(0), "Certificats non transferables");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev Returns the token URI for metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token inexistant");
        return _protectedProjects[tokenId].metadataURI;
    }
}
