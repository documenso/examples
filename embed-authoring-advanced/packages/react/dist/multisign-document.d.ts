import { CssVars } from './css-vars';
import * as React from "react";
export type EmbedMultiSignDocumentProps = {
    className?: string;
    host?: string;
    tokens: string[];
    css?: string | undefined;
    cssVars?: (CssVars & Record<string, string>) | undefined;
    darkModeDisabled?: boolean | undefined;
    name?: string | undefined;
    lockName?: boolean | undefined;
    allowDocumentRejection?: boolean | undefined;
    additionalProps?: Record<string, string | number | boolean> | undefined;
    onDocumentReady?: () => void;
    onDocumentCompleted?: (data: {
        token: string;
        documentId: number;
        recipientId: number;
    }) => void;
    onDocumentError?: (error: string) => void;
    onDocumentRejected?: (data: {
        token: string;
        documentId: number;
        recipientId: number;
        reason: string;
    }) => void;
    onAllDocumentsCompleted?: (data: {
        documents: Array<{
            token: string;
            documentId: number;
            recipientId: number;
            action: "document-completed" | "document-rejected";
            reason?: string;
        }>;
    }) => void;
};
declare function EmbedMultiSignDocument(props: EmbedMultiSignDocumentProps): React.JSX.Element;
export default EmbedMultiSignDocument;
