import { CssVars } from './css-vars';
import * as React from "react";
export type EmbedCreateTemplateProps = {
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
    onTemplateCreated?: (data: {
        externalId: string;
        templateId: number;
    }) => void;
};
declare function EmbedCreateTemplate(props: EmbedCreateTemplateProps): React.JSX.Element;
export default EmbedCreateTemplate;
