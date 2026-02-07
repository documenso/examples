import { CssVars } from './css-vars';
import * as React from "react";
export type EmbedUpdateTemplateProps = {
    className?: string;
    host?: string;
    presignToken: string;
    templateId: number;
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
    onTemplateUpdated?: (data: {
        externalId: string;
        templateId: number;
    }) => void;
};
declare function EmbedUpdateTemplate(props: EmbedUpdateTemplateProps): React.JSX.Element;
export default EmbedUpdateTemplate;
