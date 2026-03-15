
type Visibility = "public" | "anonymous" | "private";

export interface Complaint {
    id: string

    title: string
    description: string

    category: string
    category_name: string
    votes: number
    urgency_level: number

    priority: number
    visibility: Visibility

    status: number

    lat: number
    lng: number
    address?: string
    imageUrl?: string

    createdBy: string

    createdAt: Date
    updatedAt: Date
    resolvedAt?: Date
}

export interface ComplaintMedia {

    id: string

    complaintId: string

    type: "image" | "video"

    url: string

    createdAt: Date

}

export interface ComplaintVotes {
    userId: string
    complaintId: string
    createdAt: Date
}

export interface ComplaintComments {
    id: string
    complaintId: string
    userId: string
    content: string
    createdAt: Date
}