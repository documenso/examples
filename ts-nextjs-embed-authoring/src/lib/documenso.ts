import { Documenso } from "@documenso/sdk-typescript";

const apiKey = process.env.DOCUMENSO_API_KEY ?? "";
const serverURL = process.env.DOCUMENSO_HOST
  ? `${process.env.DOCUMENSO_HOST}/api/v2`
  : undefined;

export const documenso = new Documenso({
  apiKey,
  serverURL,
});
