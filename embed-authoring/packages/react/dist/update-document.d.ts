import { CssVars } from './css-vars';
import * as React from "react";
export type EmbedUpdateDocumentProps = {
    className?: string;
    host?: string;
    presignToken: string;
    documentId: number;
    externalId?: string;
    css?: string | undefined;
    cssVars?: (CssVars & Record<string, string>) | undefined;
    darkModeDisabled?: boolean | undefined;
    features?: {
        allowConfigureSignatureTypes?: boolean;
        allowConfigureLanguage?: boolean;
        allowConfigureDateFormat?: boolean;
        allowConfigureTimezone?: boolean;
        allowConfigureRedirectUrl?: boolean;
        allowConfigureCommunication?: boolean;
    };
    additionalProps?: Record<string, string | number | boolean> | undefined;
    onDocumentUpdated?: (data: {
        externalId: string;
        documentId: number;
    }) => void;
};
declare function EmbedUpdateDocument(props: EmbedUpdateDocumentProps): React.JSX.Element;
export default EmbedUpdateDocument;
