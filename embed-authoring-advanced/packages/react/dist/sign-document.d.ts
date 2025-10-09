import { CssVars } from './css-vars';
import * as React from "react";
export type EmbedSignDocumentProps = {
    className?: string;
    host?: string;
    token: string;
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
};
declare function EmbedSignDocument(props: EmbedSignDocumentProps): React.JSX.Element;
export default EmbedSignDocument;
