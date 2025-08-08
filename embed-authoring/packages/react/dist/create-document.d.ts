import { CssVars } from './css-vars';
import * as React from "react";
export type EmbedCreateDocumentProps = {
    className?: string;
    host?: string;
    presignToken: string;
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
    onDocumentCreated?: (data: {
        externalId: string;
        documentId: number;
    }) => void;
};
declare function EmbedCreateDocument(props: EmbedCreateDocumentProps): React.JSX.Element;
export default EmbedCreateDocument;
