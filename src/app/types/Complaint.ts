import { Categories } from "../utils/consts";

type Category = typeof Categories[number];
type Visibility = "public" | "anonymous" | "private";

export interface Complaint {
    id: string

    title: string
    description: string

    category: Category

    priority: number
    visibility: Visibility

    status: "pending" | "in-progress" | "resolved" | "rejected"

    lat: number
    lng: number
    address?: string

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