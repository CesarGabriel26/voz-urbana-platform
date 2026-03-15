
export const COMPLAINT_STATUS_LABELS: Record<number, string> = {
    0: 'Pendente',
    1: 'Aceita',
    2: 'Em andamento',
    3: 'Resolvido',
    [-1]: 'Rejeitado / arquivado'
};

export const PETITION_STATUS_LABELS: Record<number, string> = {
    0: 'Coletando assinaturas',
    1: 'Meta alcançada',
    2: 'Protocolado',
    3: 'Finalizado',
    [-1]: 'Rejeitado / arquivado'
};

export function getComplaintStatusLabel(status: number): string {
    return COMPLAINT_STATUS_LABELS[status] || COMPLAINT_STATUS_LABELS[0];
}

export function getPetitionStatusLabel(status: number): string {
    return PETITION_STATUS_LABELS[status] || PETITION_STATUS_LABELS[0];
}
