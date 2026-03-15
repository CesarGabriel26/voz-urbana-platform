type Visibility = "public" | "anonymous" | "private";

// Adicione campos de identificação civil para validade jurídica
export interface Petition {
    id: string;
    title: string;
    description: string;
    category: string;
    category_name?: string;

    // Metas dinâmicas
    goal: number;
    signaturesCount: number;
    
    // Abrangência para validar os 5% do eleitorado municipal
    scope: string | "neighborhood" | "city" | "state";
    cityIbgeCode?: string; // Útil para cruzar com dados do TSE

    visibility: Visibility;
    status: number;

    // Geolocalização precisa para o mapa de reclamações
    location: {
        lat: number;
        lng: number;
        address: string;
        neighborhood: string;
    };

    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;

    // Para fins legais: anexo de documento formal se necessário
    formalDocumentUrl?: string; 
}

export interface PetitionSignature {
    id: string;
    petitionId: string;
    userId: string;
    
    // DADOS LEGAIS OBRIGATÓRIOS para Projetos de Lei (Iniciativa Popular)
    // A lei exige identificação para evitar assinaturas fakes
    voterRegistrationNumber?: string; // Título de Eleitor (opcional dependendo do rigor)
    fullName: string;                // Nome completo (essencial)
    cpfHash: string;                 // Hash do CPF para evitar duplicidade sem expor o dado sensível
    
    // IP e UserAgent ajudam na auditoria de fraudes/bots
    ipAddress: string;
    userAgent: string;
    
    createdAt: Date;
}


export interface PetitionComment {
    id: string
    petitionId: string
    userId: string
    content: string
    createdAt: Date
}
