import { CssVars } from './css-vars';
import * as React from "react";
export type EmbedDirectTemplateProps = {
    className?: string;
    host?: string;
    token: string;
    externalId?: string;
    css?: string | undefined;
    cssVars?: (CssVars & Record<string, string>) | undefined;
    darkModeDisabled?: boolean | undefined;
    email?: string | undefined;
    lockEmail?: boolean | undefined;
    name?: string | undefined;
    lockName?: boolean | undefined;
    additionalProps?: Record<string, string | number | boolean> | undefined;
    onDocumentReady?: () => void;
    onDocumentCompleted?: (data: {
        token: string;
        documentId: number;
        recipientId: number;
    }) => void;
    onDocumentError?: (error: string) => void;
    onFieldSigned?: () => void;
    onFieldUnsigned?: () => void;
};
declare function EmbedDirectTemplate(props: EmbedDirectTemplateProps): React.JSX.Element;
export default EmbedDirectTemplate;
