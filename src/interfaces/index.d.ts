import { AxiosResponse } from 'axios';

/**
 * USER
 */
export interface User {
    kind: string
    id: string
    uid: string
    displayName: string
    email: string
    photoURL: string
}

export interface UserSpaces {
    items: Space[]
}

export interface Space {
    id: string
    uid: string
    title: string
    path?: string
    baseName?: string
    visibility: string
    private: boolean
    unlisted: boolean,
    pages?: Page[]
}

/**
 * SPACES
 */
export interface Spaces {
    id: string
    uid: string
    parents: string[]
    pages: Pages[]
    files: File[]
}
/**
 * PAGES
 */
export interface Pages {
    id: string
    uid: string
    title: string
    kind: string
    description: string
    path: string
    pages: Page[]
}

export interface Page {
    id: string
    uid: string
    title: string
    kind: string
    description?: string
    path?: string
    pages?: Page[]
    href?: string
    document?: Promise<AxiosResponse<Document>> | AxiosResponse<Document> | Document
}
/**
 * FILES
 */
export interface File {
    id: string
    uid: string
    name: string
    downloadURL: string
    contentType: string
}
/**
 * DOCUMENT
 */
export interface Document {
    object: string
    data: DataDocument
    nodes: NodesDocument[]
}

export interface DataDocument {
    schemaVersion: number
}

export interface NodesDocument {
    leaves?: Leaves[]
    type?: string
    isVoid?: boolean
    data?: DataDocument | Ref | {}
    nodes?: NodeNestedDocument[]
}

export interface NodeNestedDocument {
    object: string
    leaves: Leaves[]
}

export interface Leaves {
    object: string
    text: string
    marks: any[]
    selections: any[]
}

export interface Mark {
    object: string
    type: string
    data: {}
}

export interface Ref {
    kind: string
    url: string
}

type BlockType = 'heading-1' | 'heading-2' | 'heading-3' | 'paragraph' | 'embed' | 'list-unordered' | 'images' | 'code' | 'hint'
type BlockTypeSecondLevel = 'list-item' | 'image' | 'code-line'
// Per le immagini verificare data.ref.file (viene tornato un'id (recuperare dalla proprietà file dello space))
